import * as ReactQuery from "react-query"
import axios from "axios"
import { FlightWithFares, ScraperQuery, ScraperResults, SearchQuery } from "../types/scrapers"
import scrapers from "../scrapers/scrapers.json"

const scraperCode = import.meta.glob("../scrapers/*.ts", { as: "raw" })

type FR24SearchResult = typeof import("../scrapers/extra/fr24_sample.json") & typeof import("../scrapers/extra/fr24_errors_sample.json")

export type QueryPairing = {origin: string, destination: string, departureDate: string}
export type ServingCarrier = { origin: string, destination: string, airlineCode: string, airlineName: string }
type ScraperForRoute = { origin: string, destination: string, scraper: string, matchedAirlines: string[], departureDate: string }
export type ScrapersForRoutes = {[key: string]: ScraperForRoute}

export const useQueriesWithKeys = <T extends any[]>(queries: readonly [...ReactQuery.QueriesOptions<T>]) => {
  return ReactQuery.useQueries(queries).map((query, index) => ({ ...query, queryKey: queries[index].queryKey }))
}

export const useAwardSearch = (searchQuery: SearchQuery) => {
  // Take all origins and destinations and create a list of all possible pairs
  const pairings = searchQuery.origins.flatMap((origin) => searchQuery.destinations.map((destination) => ({ origin, destination, departureDate: searchQuery.departureDate }) as QueryPairing))

  // Return the list of carriers that fly the given pairings
  const fetchServingCarriers = async ({ signal, meta }: ReactQuery.QueryFunctionContext) => {
    const pairing = meta as QueryPairing
    const dataHtml = (await axios.post<string>(`${import.meta.env.VITE_BROWSERLESS_AWS_PROXY_URL}/content`, { url: `https://api.flightradar24.com/common/v1/search.json?query=default&origin=${pairing.origin}&destination=${pairing.destination}` }, { headers: { "x-api-key": import.meta.env.VITE_BROWSERLESS_AWS_PROXY_API_KEY }, signal })).data
    const data: FR24SearchResult = JSON.parse(new DOMParser().parseFromString(dataHtml, "text/html").documentElement.textContent || "")

    if (data.errors)
      throw new Error(`${data.errors.message} -- ${JSON.stringify(data.errors.errors)}`)
    if (!data.result.response.flight.data)
      return []

    const carriers = data.result.response.flight.data
      .map((item) => ({ origin: item.airport.origin.code.iata, destination: item.airport.destination.code.iata, airlineCode: item.airline?.code.iata, airlineName: item.airline?.name } as ServingCarrier))
      .filter((item, index, self) => self.findIndex((t) => t.origin === item.origin && t.destination === item.destination && t.airlineCode === item.airlineCode) === index)   // remove duplicates
      .filter((item) => item.airlineCode && item.airlineName)   // remove flights without sufficient data (usually private flights)
      .filter((item) => !scrapers.excludeAirlines.includes(item.airlineCode!))
    return carriers
  }

  const servingCarriersQueries = useQueriesWithKeys<ServingCarrier[]>(pairings.map((pairing) => ({
    queryKey: ["servingCarriers", pairing.origin, pairing.destination],
    queryFn: fetchServingCarriers,
    meta: pairing
  })))

  const servingCarriers = servingCarriersQueries
    .filter((item) => item.data)
    .map((item) => item.data)
    .flat() as ServingCarrier[]

  // Group route+scraper and find which airline fits under which scraper
  const scrapersForRoutes: ScrapersForRoutes = {}
  servingCarriers.forEach((servingCarrier) => {
    const expandSupportedAirlines = (airlines: string[]) => airlines.flatMap((airline) => scrapers.airlineGroups[airline as keyof typeof scrapers.airlineGroups] || airline)
    scrapers.scrapers.filter((scraper) => expandSupportedAirlines(scraper.supportedAirlines).includes(servingCarrier.airlineCode!)).forEach((scraper) => {
      const key = `${servingCarrier.origin}${servingCarrier.destination}${scraper.name}`
      if (!scrapersForRoutes[key]) {
        scrapersForRoutes[key] = { origin: servingCarrier.origin, destination: servingCarrier.destination, scraper: scraper.name, matchedAirlines: [servingCarrier.airlineName], departureDate: searchQuery.departureDate }

      } else if (!scrapersForRoutes[key].matchedAirlines.includes(servingCarrier.airlineName)) {
        scrapersForRoutes[key].matchedAirlines.push(servingCarrier.airlineName)
      }
    })
  })

  // Run the scrapers
  const fetchAwardAvailability = async ({ signal, meta, queryKey }: ReactQuery.QueryFunctionContext) => {
    const scraperQuery = meta as ScraperForRoute
    const scraperPath = (name: string) => {
      const localPath = Object.keys(scraperCode).find((scraperKey) => scraperKey.indexOf(`${name}.ts`) > -1)
      if (!localPath) throw new Error(`Could not find scraper ${name}`)
      return localPath
    }

    const tsCodeCommon = scraperCode[scraperPath("common")] as unknown as string
    let tsCode = scraperCode[scraperPath(scraperQuery.scraper)] as unknown as string
    tsCode = tsCode.replace(/import .* from "\.\/common"/, tsCodeCommon)
    const ts = await import("typescript")
    const jsCode = ts.transpile(tsCode, { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS })

    const postData: { code: string, context: ScraperQuery } = { code: jsCode, context: scraperQuery }
    const scraperResults = (await axios.post<ScraperResults>(`${import.meta.env.VITE_BROWSERLESS_AWS_PROXY_URL}/function?key=${queryKey}`, postData, { headers: { "x-api-key": import.meta.env.VITE_BROWSERLESS_AWS_PROXY_API_KEY }, signal })).data
    return scraperResults.flightsWithFares
  }

  const searchQueries = useQueriesWithKeys<FlightWithFares[]>(Object.entries(scrapersForRoutes).map(([key, scraperQuery]) => ({
    queryKey: ["awardAvailability", key, scraperQuery.departureDate],
    staleTime: 1000 * 60 * 15,
    cacheTime: 1000 * 60 * 15,
    retry: 1,
    queryFn: fetchAwardAvailability,
    meta: scraperQuery,
  })))

  const scraperResults = searchQueries
    .filter((item) => item.data)
    .map((item) => item.data)
    .flat() as FlightWithFares[]

  // Combine fares from all scrapers per flight
  let flights = [] as FlightWithFares[]
  scraperResults.forEach((scraperResult) => {
    const existingFlight = flights.find((flight) => flight.flightNo === scraperResult.flightNo)
    if (existingFlight) {
      existingFlight.fares.push(...scraperResult.fares)
    } else {
      flights.push(scraperResult)
    }
  })

  // Load amenities for all flights
  flights = flights.map((flight) => {
    const amenities = scrapers.airlineAmenities.find((checkAmenity) => checkAmenity.airlineCode === flight.flightNo.substring(0, 2))
    const hasPods = amenities?.podsAircraft.some((checkStr) => flight.aircraft.indexOf(checkStr) > -1)
    const flightAmenities = { hasPods: flight.amenities?.hasPods ?? hasPods }
    return { ...flight, amenities: flightAmenities }
  })

  const loadingQueries = [servingCarriersQueries, searchQueries].flat().filter((item) => item.isLoading).map((item) => item.queryKey as string[])
  const errors = [servingCarriersQueries, searchQueries].flat().filter((item) => item.error).map((item) => ({ queryKey: item.queryKey, error: item.error as Error }))

  return { searchResults: flights, pairings, servingCarriers, scrapersForRoutes, loadingQueries, errors }
}
