import { ScraperMetadata } from "../../arkalis/arkalis.js"
import { FlightFare, FlightWithFares, AwardWizQuery, AwardWizScraper } from "../awardwiz-types.js"
import { AAResponse, Slice } from "../scraper-types/aa.js"

export const meta: ScraperMetadata = {
  name: "aa",
  blockUrls: ["cludo.com", "entrust.net", "tiqcdn.com", "cludo.com", "*.go-mpulse.net"],
}

export const runScraper: AwardWizScraper = async (arkalis, query) => {
  // Navigate directly to the search results page
  const url = `https://www.aa.com/booking/find-flights?d=${query.departureDate}&f=${query.origin}&t=${query.destination}&c=1&a=1&ss=1&type=award`
  arkalis.goto(url)
  
  // Wait for the page to load
  await arkalis.waitFor({
    "success": { type: "html", html: "American Airlines" },
    "error": { type: "html", html: "error" }
  })
  
  // Wait a moment for the page to initialize
  await arkalis.wait(5000)

  arkalis.log("fetching flight data directly")
  
  // Execute the API call directly and get the response
  const requestData = {
    metadata: { selectedProducts: [], tripType: "OneWay", udo: {} },
    passengers: [{ type: "adult", count: 1 }],
    queryParams: { sliceIndex: 0, sessionId: "", solutionId: "", solutionSet: "" },
    requestHeader: { clientId: "AAcom" },
    slices: [{
      allCarriers: true,
      cabin: "",
      departureDate: query.departureDate,
      destination: query.destination,
      includeNearbyAirports: false,
      origin: query.origin,
      departureTime: "040001"
    }],
    tripOptions: { locale: "en_US", searchType: "Award" }
  };
  
  // Use evaluate to execute the fetch call and get the response directly
  // This is more reliable than waiting for network events
  const responseText = await arkalis.evaluate<string>(`
    (async () => {
      try {
        const response = await fetch("https://www.aa.com/booking/api/search/itinerary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*"
          },
          body: JSON.stringify(${JSON.stringify(requestData)})
        });
        
        return await response.text();
      } catch (error) {
        return JSON.stringify({ error: error.message });
      }
    })()
  `);
  
  // Parse the JSON response
  let json: AAResponse;
  try {
    json = JSON.parse(responseText) as AAResponse;
  } catch (e) {
    throw new Error(`Failed to parse API response: ${responseText}`);
  }

  // aa can return errors in two ways
  if ((json.errorNumber ?? 0) > 0) {
    if ("error" in json && json.errorNumber !== 309)         // only allow error 309
      throw new Error(json.error)
    if ("message" in json && json.errorNumber !== 1100)      // only allow historic date errors (1100)
      throw new Error(json.message)
  }

  arkalis.log("parsing")
  return standardizeResults(json.slices ?? [], query)
}

const standardizeResults = (slices: Slice[], query: AwardWizQuery): FlightWithFares[] => (
  slices.map((slice) => {
    const segment = slice.segments[0]!
    const leg = segment.legs[0]!
    const result: FlightWithFares = {
      departureDateTime: segment.departureDateTime.replace(" ", "").replace("T", " ").slice(0, 16),
      arrivalDateTime: segment.arrivalDateTime.replace(" ", "").replace("T", " ").slice(0, 16),
      origin: segment.origin.code,
      destination: segment.destination.code,
      flightNo: `${segment.flight.carrierCode} ${segment.flight.flightNumber}`,
      duration: slice.durationInMinutes,
      aircraft: leg.aircraft.name,
      amenities: {
        hasPods: leg.amenities.some((a) => a.includes("lie-flat")),
        hasWiFi: leg.amenities.some((a) => a.includes("wifi"))
      },
      fares: slice.pricingDetail
        .filter((product) => product.productAvailable)
        .map((product): FlightFare => {
          const cabinByFareCode = { "F": "first", "J": "business", "W": "economy", "Y": "economy" }[product.extendedFareCode?.[0] ?? ""]
          const awardCabinByFareCode = { "Z": "first", "U": "business", "T": "economy", "X": "economy" }[product.extendedFareCode?.[0] ?? ""]

          let cabin = awardCabinByFareCode ?? cabinByFareCode ??
            { "COACH": "economy", "PREMIUM_ECONOMY": "economy", "FIRST": "first", "BUSINESS": "business" }[product.productType]
          if (!cabin)
            throw new Error(`Unknown cabin type on ${segment.flight.carrierCode} ${segment.flight.flightNumber}. Fare code: ${product.extendedFareCode?.[0] ?? "undefined"}, product type: ${product.productType}\n${JSON.stringify(segment, null, 2)}`)

          if (segment.flight.carrierCode === "B6" && cabin === "first")   // jetblue doesn't have first class
            cabin = "business"

          return {
            cash: product.perPassengerTaxesAndFees.amount,
            currencyOfCash: product.perPassengerTaxesAndFees.currency,
            miles: product.perPassengerAwardPoints,
            cabin,
            scraper: "aa",
            bookingClass: product.extendedFareCode?.[0],
            isSaverFare: awardCabinByFareCode !== undefined
          } satisfies FlightFare
        })
        .reduce<FlightFare[]>((lowestCabinFares, fare) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (fare.cabin === undefined)
            throw new Error(`Unknown cabin type on ${segment.flight.carrierCode} ${segment.flight.flightNumber}`)

          const existing = lowestCabinFares.find((check) => check.cabin === fare.cabin)
          if (existing && existing.miles < fare.miles)
            return lowestCabinFares
          return [...lowestCabinFares.filter((check) => check.cabin !== fare.cabin), fare]
        }, [])
    }

    if (slice.segments.length > 1)
      return
    if (segment.origin.code !== query.origin || segment.destination.code !== query.destination)
      return

    return result
  }).filter((result): result is FlightWithFares => !!result)
)
