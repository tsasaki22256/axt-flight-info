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
        "dc:date":"2021-01-15T16:10:48+09:00",
        "owl:sameAs": "odpt.FlightInformationDeparture:JAL.HND.JL163",
        "odpt:airline": "odpt.Operator:JAL",
        "odpt:aircraftType": "73H",
        "odpt:flightStatus": "odpt.FlightStatus:Departed",
        "odpt:departureAirport": "odpt.Airport:HND",
        "odpt:destinationAirport": "odpt.Airport:AXT",
        "odpt:actualDepartureTime": "10:47",
        "odpt:scheduledDepartureTime": "10:55"
      },
      arrival: {
        "dc:date":"2021-01-15T16:13:44+09:00",
        "owl:sameAs": "odpt.FlightInformationArrival:JAL.AXT.JL163",
        "odpt:airline": "odpt.Operator:JAL",
        "odpt:aircraftType": "73H",
        "odpt:flightStatus": "odpt.FlightStatus:Arrived",
        "odpt:originAirport": "odpt.Airport:HND",
        "odpt:arrivalAirport": "odpt.Airport:AXT",
        "odpt:actualArrivalTime": "11:46",
        "odpt:scheduledArrivalTime": "12:05"
      }
    };

    const testParsed = parseFlightDataJsonElement(testData.departure, testData.arrival);
    expect(testParsed.airline).toBe('JAL');
    expect(testParsed.number).toBe('163');
    expect(testParsed.aircraftType).toBe('73H');
    expect(testParsed.origin).toBe('羽田');
    expect(testParsed.actualArrivalTime).toBe('11:46');
    expect(testParsed.isEstimatedArrivalTime).toBeFalsy();
    expect(testParsed.scheduledArrivalTime).toBe('12:05');
    expect(testParsed.actualDepartureTime).toBe('10:47');
    expect(testParsed.isEstimatedDepartureTime).toBeFalsy();
    expect(testParsed.scheduledDepartureTime).toBe('10:55');
    expect(testParsed.date).toBe('2021-01-15T16:13:44+09:00');
    expect(testParsed.status).toBe('到着済み');
    expect(testParsed.cancelled).toBeFalsy();
    expect(testParsed.arrivalDelay).toBe(-19);
    expect(testParsed.departureDelay).toBe(-8);
  });
});
