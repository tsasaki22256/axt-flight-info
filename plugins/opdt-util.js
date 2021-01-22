
export function newEmptyData() {
  const empty = {
    airline: '',
    number: '',
    aircraftType: '',
    origin: '',
    destination: '',

    actualArrivalTime: '',
    isEstimatedArrivalTime: false,
    scheduledArrivalTime: '',
    arrivalInfoSummary: '',
    arrivalInfoText: '',
    arrivalStatus: '',

    actualDepartureTime: '',
    isEstimatedDepartureTime: false,
    scheduledDepartureTime: '',
    departureInfoSummary: '',
    departureInfoText: '',
    departureStatus: '',

    date: '',

    status: '',
    cancelled: false,
    infoSummary: '',
    infoText: '',
    arrivalDelay: 0,
    departureDelay: 0,
  };

  return Object.assign({}, empty)
}

export function toAirportName(airportId) {
  let airport = '';

  switch (airportId) {
    case 'odpt.Airport:CTS':
      airport = '新千歳';
      break;
    case 'odpt.Airport:HND':
      airport = '羽田';
      break;
    case 'odpt.Airport:ITM':
      airport = '伊丹';
      break;
    case 'odpt.Airport:NGO':
      airport = '名古屋';
      break;
  }

  return airport;
}

export function toAirlineName(airlineId) {
  let airline = '';

  switch (airlineId) {
    case 'odpt.Operator:ANA':
      airline = 'ANA';
      break;
    case 'odpt.Operator:JAL':
      airline = 'JAL';
      break;
  }

  return airline;
}

export function toShortFlightNumber(numberId) {
  if (!numberId) return '';

  return numberId.replace(/^.+\.[A-Z]+/, '');
}

export function toFlightStatusTitle(statusId) {
  let status = '';

  switch (statusId) {
    case 'odpt.FlightStatus:Adjusting':
      status = '機材繰り';
      break;
    case 'odpt.FlightStatus:Arrived':
      status = '到着済み';
      break;
    case 'odpt.FlightStatus:BaggageAvailable':
      status = '手荷物引渡中';
      break;
    case 'odpt.FlightStatus:BoardingComplete':
      status = '搭乗終了';
      break;
    case 'odpt.FlightStatus:Cancelled':
      status = '欠航';
      break;
    case 'odpt.FlightStatus:CheckInClose':
      status = '搭乗手続終了';
      break;
    case 'odpt.FlightStatus:CheckIn':
      status = '搭乗手続中';
      break;
    case 'odpt.FlightStatus:Delayed':
      status = '遅れ';
      break;
    case 'odpt.FlightStatus:Departed':
      status = '出発済み';
      break;
    case 'odpt.FlightStatus:EstimatedArrival':
      status = '到着予定';
      break;
    case 'odpt.FlightStatus:EstimatedDeparture':
      status = '出発予定';
      break;
    case 'odpt.FlightStatus:FinalCall':
      status = '最終搭乗案内';
      break;
    case 'odpt.FlightStatus:InAir':
      status = '航行中';
      break;
    case 'odpt.FlightStatus:Indefinite':
      status = '時刻未定';
      break;
    case 'odpt.FlightStatus:Landed':
      status = '着陸済み';
      break;
    case 'odpt.FlightStatus:LateArrival':
      status = '使用機遅れ';
      break;
    case 'odpt.FlightStatus:LeftGate':
      status = 'ゲート出発済み';
      break;
    case 'odpt.FlightStatus:Maintenance':
      status = '使用機整備';
      break;
    case 'odpt.FlightStatus:NewTime':
      status = '時刻変更';
      break;
    case 'odpt.FlightStatus:NowBoarding':
      status = '搭乗中';
      break;
    case 'odpt.FlightStatus:OnTime':
      status = '定刻';
      break;
    case 'odpt.FlightStatus:Other':
      status = 'その他';
      break;
    case 'odpt.FlightStatus:PostponedTomorrow':
      status = '翌日運行';
      break;
    case 'odpt.FlightStatus:StopCheckIn':
      status = '搭乗手続中止中';
      break;
    case 'odpt.FlightStatus:Takeoff':
      status = '離陸済み';
      break;
    case 'odpt.FlightStatus:Unknown':
      status = '不明';
      break;
    case 'odpt.FlightStatus:WeatherCheck':
      status = '天候調査中';
      break;
    case 'odpt.FlightStatus:Yesterday':
      status = '昨日便';
      break;
    case 'odpt.FlightStatus:DestinationChanged':
      status = '到着地変更';
      break;
    case 'odpt.FlightStatus:BadWeather':
      status = '天候不良';
      break;
  }

  return status;
}

export function calcTimeDiff(a, b) {
  return ((new Date('2020/1/1 ' + b + ':00')) - (new Date('2020/1/1 ' + a + ':00'))) / 1000 / 60;
}

export function extractTimeFromDateString(dateStr) {
  let time = '';

  const m = dateStr.match(/([0-9]+:[0-9]+):[0-9]+/);
  if (m) {
    time = m[1];
  }

  return time;
}
