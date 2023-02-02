import { gotoPage, waitForJsonSuccess } from "../common.js"
import { AwardWizScraper, FlightFare, FlightWithFares } from "../types.js"
import c from "ansi-colors"
import { ScraperMetadata } from "../scraper.js"
import { AeroplanResponse } from "./samples/aeroplan.js"

export const meta: ScraperMetadata = {
  name: "aeroplan",
  blockUrls: [],
  forceCacheUrls: ["*/aeroplan/redeem/font/*", /^.*\/ac\/applications\/loyalty\/(?!.*t=).*$/giu, "*/en-CA.json", "*.svg"]
}

export const runScraper: AwardWizScraper = async (sc, query) => {
  await gotoPage(sc, `https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=${query.origin}&dest0=${query.destination}&departureDate0=${query.departureDate}&lang=en-CA&tripType=O&ADT=1&YTH=0&CHD=0&INF=0&INS=0&marketCode=TNB`, "commit")

  sc.log("waiting for results")
  const fetchFlights = await waitForJsonSuccess<AeroplanResponse>(sc, "https://akamai-gw.dbaas.aircanada.com/loyalty/dapidynamic/1ASIUDALAC/v2/search/air-bounds", {
    "anti-botting1": sc.page.waitForFunction(() => document.location.toString() === "https://www.aircanada.com/aeroplan/redeem/"),
    "anti-botting2": sc.page.waitForResponse((resp) => /^.*\/loyalty\/dapidynamic\/.*\/v2\/reward\/market-token/iu.exec(resp.url()) !== null && resp.status() === 403),
    "anti-botting3": sc.page.getByText("Air Canada's website is not available right now.")
  })
  if (fetchFlights === "anti-botting1" || fetchFlights === "anti-botting2")
    throw new Error("anti-botting")
  if (typeof fetchFlights === "string") {
    sc.log(c.yellow(`WARN: ${fetchFlights}`))
    return []
  }

  sc.log("parsing results")
  const flightsWithFares: FlightWithFares[] = []
  if (fetchFlights.data?.airBoundGroups && fetchFlights.data.airBoundGroups.length > 0) {
    const flights = standardizeResults(fetchFlights, query.origin, query.destination)
    flightsWithFares.push(...flights)
  }

  return flightsWithFares
}

const standardizeResults = (raw: AeroplanResponse, origOrigin: string, origDestination: string) => {
  const results: FlightWithFares[] = []
  for (const group of raw.data?.airBoundGroups ?? []) {
    const { flightId } = group.boundDetails.segments[0]!
    const flightLookup = raw.dictionaries.flight[flightId as keyof typeof raw.dictionaries.flight]!

    const result: FlightWithFares = {
      departureDateTime: flightLookup.departure.dateTime.slice(0, 19).replace("T", " "),
      arrivalDateTime: flightLookup.arrival.dateTime.slice(0, 19).replace("T", " "),
      origin: flightLookup.departure.locationCode,
      destination: flightLookup.arrival.locationCode,
      flightNo: `${flightLookup.marketingAirlineCode} ${flightLookup.marketingFlightNumber}`,
      duration: flightLookup.duration / 60,
      aircraft: raw.dictionaries.aircraft[flightLookup.aircraftCode as keyof typeof raw.dictionaries.aircraft],
      fares: [],
      amenities: {
        hasPods: undefined,
        hasWiFi: undefined  // populated via json from https://www.aircanada.com/aeroplan/redeem/main-es2015.09be3572766daf3ffaa9.js from the aircraftWithWifi variable
      },
    }

    // Skip flights with connections
    if (group.boundDetails.segments.length > 1)
      continue

    if (flightLookup.departure.locationCode !== origOrigin || flightLookup.arrival.locationCode !== origDestination)
      continue

    const aircraft = raw.dictionaries.aircraft[flightLookup.aircraftCode as keyof typeof raw.dictionaries.aircraft]
    if (!aircraft)
      throw new Error(`Unknown aircraft type: ${flightLookup.aircraftCode}`)

    for (const fare of group.airBounds) {
      const cabinShortToCabin: Record<string, string> = { eco: "economy", ecoPremium: "economy", business: "business", first: "first" }
      let cabin = cabinShortToCabin[fare.availabilityDetails[0]!.cabin]
      if (!cabin)
        throw new Error(`Unknown cabin type: ${fare.availabilityDetails[0]!.cabin}`)

      const { bookingClass } = fare.availabilityDetails[0]!

      // Override for United marketing its Business class as First
      if (bookingClass === "I" && flightLookup.marketingAirlineCode === "UA")
        cabin = "economy"

      const fareToAdd: FlightFare = {
        cabin,
        bookingClass,
        miles: fare.prices.milesConversion.convertedMiles.base,
        currencyOfCash: fare.prices.milesConversion.remainingNonConverted.currencyCode,
        cash: Math.ceil(fare.prices.milesConversion.convertedMiles.totalTaxes / 100),
        scraper: "aeroplan"
      }

      // Only keep the lowest fare for each cabin
      const existingForCabin = result.fares.find((f) => f.cabin === fareToAdd.cabin)
      if (existingForCabin) {
        if (fareToAdd.miles < existingForCabin.miles) {
          result.fares = result.fares.filter((f) => f !== existingForCabin)
          result.fares.push(fareToAdd)
        }
      } else {
        result.fares.push(fareToAdd)
      }
    }

    results.push(result)
  }

  return results
}