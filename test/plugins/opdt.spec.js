import {
  parseFlightDataJson,
  parseFlightDataJsonElement,
  getLatestUpdateDate,
  combineArrivalsAndDepartures,
  checkSpotStatus
} from '@/plugins/opdt';

describe('plugins/opdt', () => {
  test('parseFlightDataJsonElement', () => {
    const emptyParsed = parseFlightDataJsonElement({}, {});
    expect(emptyParsed.status).toBeDefined();

    const testData = {
      departure: {
        "owl:sameAs": "odpt.FlightInformationDeparture:JAL.HND.JL163",
        "odpt:airline": "odpt.Operator:JAL",
        "odpt:operator": "odpt.Operator:JAL",
        "odpt:aircraftType": "73H",
        "odpt:flightStatus": "odpt.FlightStatus:Departed",
        "odpt:departureAirport": "odpt.Airport:HND",
        "odpt:destinationAirport": "odpt.Airport:AXT",
        "odpt:actualDepartureTime": "10:47",
        "odpt:scheduledDepartureTime": "10:55"
      },
      arrival: {
        "owl:sameAs": "odpt.FlightInformationArrival:JAL.AXT.JL163",
        "odpt:airline": "odpt.Operator:JAL",
        "odpt:operator": "odpt.Operator:JAL",
        "odpt:aircraftType": "73H",
        "odpt:flightStatus": "odpt.FlightStatus:Arrived",
        "odpt:originAirport": "odpt.Airport:HND",
        "odpt:arrivalAirport": "odpt.Airport:AXT",
        "odpt:actualArrivalTime": "11:46",
        "odpt:scheduledArrivalTime": "12:05"
      }
    };
    const testParsed = parseFlightDataJsonElement(testData.departure, testData.arrival);
    expect(testParsed.number).toBe('163');
    expect(testParsed.status).toBe('到着済み');
    expect(testParsed.cancelled).toBeFalsy();
  });
});
