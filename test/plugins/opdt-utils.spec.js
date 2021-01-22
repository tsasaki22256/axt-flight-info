import {
  newEmptyData,
  toAirportName,
  toAirlineName,
  toShortFlightNumber,
  toFlightStatusTitle,
  calcTimeDiff,
  extractTimeFromDateString,
} from '@/plugins/opdt-util';

describe('plugins/opdt-utils', () => {
  test('newEmptyData', () => {
    const emptyData = newEmptyData();
    expect(emptyData.airline).toBeDefined();
  });

  test('toAirportName', () => {
    expect(toAirportName('odpt.Airport:HND')).toBe('羽田');
    expect(toAirportName('')).toBe('');
  });

  test('toAirlineName', () => {
    expect(toAirlineName('odpt.Operator:ANA')).toBe('ANA');
    expect(toAirlineName('')).toBe('');
  });

  test('toShortFlightNumber', () => {
    expect(toShortFlightNumber('odpt.FlightInformationArrival:JAL.AXT.JL2171')).toBe('2171');
  });

  test('toFlightStatusTitle', () => {
    expect(toFlightStatusTitle('odpt.FlightStatus:Arrived')).toBe('到着済み');
    expect(toFlightStatusTitle('')).toBe('');
  });

  test('calcTimeDiff', () => {
    expect(calcTimeDiff('15:30', '16:45')).toBe(75);
  });

  test('extractTimeFromDateString', () => {
    expect(extractTimeFromDateString('2021/1/23 2:44:39')).toBe('2:44');
  });
});
