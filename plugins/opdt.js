import {
  newEmptyData,
  toAirportName,
  toAirlineName,
  toShortFlightNumber,
  toFlightStatusTitle,
  calcTimeDiff,
  extractTimeFromDateString,
} from './opdt-util';

async function fetchFlightData(axios, consumerkey) {
  const flightDataJson = await downloadFlightDataJson(axios, consumerkey);

  const flightData = {
    arrivals: [],
    departures: [],
    combined: [],
    date: '',
    time: '',
  };

  // 到着便
  for (let arrInfo of flightDataJson.arrivals.arrivalInfo) {
    const depIndex = flightDataJson.arrivals.departureInfo
      .findIndex(x => toShortFlightNumber(arrInfo['owl:sameAs']) === toShortFlightNumber(x['owl:sameAs']));

    if (depIndex !== -1) {
      const depInfo = flightDataJson.arrivals.departureInfo[depIndex];
      flightData.arrivals.push(parseFlightDataJson(depInfo, arrInfo));
    }
  }

  // 出発便
  for (let arrInfo of flightDataJson.departures.arrivalInfo) {
    const depIndex = flightDataJson.departures.departureInfo
      .findIndex(x => toShortFlightNumber(arrInfo['owl:sameAs']) === toShortFlightNumber(x['owl:sameAs']));

    if (depIndex !== -1) {
      const depInfo = flightDataJson.departures.departureInfo[depIndex];
      flightData.departures.push(parseFlightDataJson(depInfo, arrInfo));
    }
  }

  // 最新の更新日時を取得
  flightData.date = getLatestUpdateDate(flightData.arrivals, flightData.departures);
  flightData.time = extractTimeFromDateString(flightData.date);
  
  // infoSummary, infoText
  for (let i = 0; i < flightData.arrivals.length; i++) {
    flightData.arrivals[i].infoSummary = flightData.arrivals[i].arrivalInfoSummary;
    flightData.arrivals[i].infoText = flightData.arrivals[i].arrivalInfoText;
  }

  for (let i = 0; i < flightData.departures.length; i++) {
    flightData.departures[i].infoSummary = flightData.departures[i].departureInfoSummary;
    flightData.departures[i].infoText = flightData.departures[i].departureInfoText;
  }

  // 時間でソート
  flightData.arrivals.sort((a, b) => a.scheduledArrivalTime > b.scheduledArrivalTime ? 1 : -1);
  flightData.departures.sort((a, b) => a.scheduledDepartureTime > b.scheduledDepartureTime ? 1 : -1);

  // 到着便と出発便を連結
  flightData.combined = combineArrivalsAndDepartures(flightData.arrivals, flightData.departures);

  return flightData;
}

async function downloadFlightDataJson(axios, consumerkey) {
  const ODPT_URL_FLIGHTINFOARR = 'https://api.odpt.org/api/v4/odpt:FlightInformationArrival';
  const ODPT_URL_FLIGHTINFODEP = 'https://api.odpt.org/api/v4/odpt:FlightInformationDeparture';

  const axArrivalInfoOfArrivals = axios.$get(`${ODPT_URL_FLIGHTINFOARR}?odpt:arrivalAirport=odpt.Airport:AXT&acl:consumerKey=${consumerkey}`);
  const axDepartureInfoOfArrivals = axios.$get(`${ODPT_URL_FLIGHTINFODEP}?odpt:destinationAirport=odpt.Airport:AXT&acl:consumerKey=${consumerkey}`);
  const axArrivalInfoOfDepartures = axios.$get(`${ODPT_URL_FLIGHTINFOARR}?odpt:originAirport=odpt.Airport:AXT&acl:consumerKey=${consumerkey}`);
  const axDepartureInfoOfDepartures = axios.$get(`${ODPT_URL_FLIGHTINFODEP}?odpt:departureAirport=odpt.Airport:AXT&acl:consumerKey=${consumerkey}`);

  return {
    arrivals: {
      arrivalInfo: await axArrivalInfoOfArrivals,
      departureInfo: await axDepartureInfoOfArrivals
    },
    departures: {
      arrivalInfo: await axArrivalInfoOfDepartures,
      departureInfo: await axDepartureInfoOfDepartures
    }
  };
}

function parseFlightDataJson(departureInfo, arrivalInfo) {
  const parsed = {
    airline: toAirlineName(arrivalInfo['odpt:airline']),
    number: toShortFlightNumber(arrivalInfo['owl:sameAs']),
    aircraftType: arrivalInfo['odpt:aircraftType'],
    origin: toAirportName(arrivalInfo['odpt:originAirport']),
    destination: toAirportName(arrivalInfo['odpt:arrivalAirport']),

    actualArrivalTime: arrivalInfo['odpt:estimatedArrivalTime'] || arrivalInfo['odpt:actualArrivalTime'],
    isEstimatedArrivalTime: arrivalInfo['odpt:estimatedArrivalTime'] ? true : false,
    scheduledArrivalTime: arrivalInfo['odpt:scheduledArrivalTime'],
    arrivalInfoSummary: arrivalInfo['odpt:flightInformationSummary']?.ja,
    arrivalInfoText: arrivalInfo['odpt:flightInformationText']?.ja,
    arrivalStatus: toFlightStatusTitle(arrivalInfo['odpt:flightStatus']),

    actualDepartureTime: departureInfo['odpt:estimatedDepartureTime'] || departureInfo['odpt:actualDepartureTime'],
    isEstimatedDepartureTime: departureInfo['odpt:estimatedDepartureTime'] ? true : false,
    scheduledDepartureTime: departureInfo['odpt:scheduledDepartureTime'],
    departureInfoSummary: departureInfo['odpt:flightInformationSummary']?.ja,
    departureInfoText: departureInfo['odpt:flightInformationText']?.ja,
    departureStatus: toFlightStatusTitle(departureInfo['odpt:flightStatus']),

    date: departureInfo['dc:date'] > arrivalInfo['dc:date'] ? departureInfo['dc:date'] : arrivalInfo['dc:date'],

    status: '',
    cancelled: false,
    infoSummary: '',
    infoText: '',
    arrivalDelay: 0,
    departureDelay: 0,
  };

  // ステータス：到着情報が '到着予定' なら出発情報を使用
  if (parsed.arrivalStatus === '到着予定') {
    parsed.status = parsed.departureStatus;
  }
  else {
    parsed.status = parsed.arrivalStatus;
  }

  // 欠航便か？
  parsed.cancelled = (parsed.status === '欠航');

  // TBD
  if (parsed.actualArrivalTime && parsed.actualArrivalTime.indexOf('to be determined') != -1) {
    parsed.actualArrivalTime = 'TBD';
  }

  if (parsed.actualDepartureTime && parsed.actualDepartureTime.indexOf('to be determined') != -1) {
    parsed.actualDepartureTime = 'TBD';
  }

  // 遅れ分数
  if (parsed.actualArrivalTime && parsed.scheduledArrivalTime) {
    parsed.arrivalDelay = calcTimeDiff(parsed.scheduledArrivalTime, parsed.actualArrivalTime);
  }

  if (parsed.actualDepartureTime && parsed.scheduledDepartureTime) {
    parsed.departureDelay = calcTimeDiff(parsed.scheduledDepartureTime, parsed.actualDepartureTime);
  }

  return parsed;
}

function getLatestUpdateDate(arrivals, departures) {
  const flatFlightData = [...arrivals, ...departures];

  let date = '';

  for (let data of flatFlightData) {
    if (data.date > date) {
      date = new Date(data.date).toLocaleString();
    }
  }

  return date;
}

function combineArrivalsAndDepartures(arrivals, departures) {
  // 機番をキーとして検索するための辞書を作成
  const makeDictionary = data => {
    const dic = [];

    for (let i = 0; i < data.length; i++) {
      dic[data[i].number] = data[i];
    }

    return dic;
  };

  const dic = {
    arrivals: makeDictionary(arrivals),
    departures: makeDictionary(departures),
  };

  // 到着便・出発便を連結したデータを作成
  let combined = [];
  let combinedNoArrival = [];

  const NUMBER_PAIR = [
    ['', '402'],
    ['', '1652'],
    ['161', '162'],
    ['401', '404'],
    ['1837', '1838'],
    ['2171', '2172'],
    ['1651', '1831'],
    ['403', '406'],
    ['2821', '2822'],
    ['163', '164'],
    ['1653', '1654'],
    ['1832', '1833'],
    ['2173', '2174'],
    ['405', '408'],
    ['1839', '1840'],
    ['165', '166'],
    ['1834', '1656'],
    ['2179', '2176'],
    ['407', '410'],
    ['2827', '2828'],
    ['167', '168'],
    ['1655', ''],
    ['409', ''],
  ];
  
  for (let i = 0; i < NUMBER_PAIR.length; i++) {
    const numArr = NUMBER_PAIR[i][0];
    const numDep = NUMBER_PAIR[i][1];
    const arrival = (numArr === '') ? newEmptyData() : dic.arrivals[numArr];
    const departure = (numDep === '') ? newEmptyData() : dic.departures[numDep];

    (numArr === '' ? combinedNoArrival : combined).push({
      arrival: arrival,
      departure: departure,
    });
  }

  // ソート
  combined.sort((a, b) => a.arrival.scheduledArrivalTime > b.arrival.scheduledArrivalTime ? 1 : -1);
  combinedNoArrival.sort((a, b) => a.departure.scheduledDepartureTime > b.departure.scheduledDepartureTime ? 1 : -1);

  combined = [...combinedNoArrival, ...combined];

  // 駐機中 or スポットイン／アウト中？
  for (let i = 0; i < combined.length; i++) {
    const spotStatus = checkSpotStatus(combined[i]);

    combined[i].spotStatus = spotStatus;
    combined[i].arrival.spotStatus = (spotStatus === 'in') ? spotStatus : '';
    combined[i].departure.spotStatus = (spotStatus === 'out') ? spotStatus : '';
  }

  return combined;
}

// 航空機がスポットに滞在中 ("on") か、スポットイン／アウト中か ("in" | "out")、不在か("")
// combined: 到着便・発着便の連結済みデータ
function checkSpotStatus(combined) {
  const a = combined.arrival;
  const d = combined.departure;

  if (a.cancelled || d.cancelled) return '';

  // 到着していて、出発していない
  if (!a.isEstimatedArrivalTime && d.isEstimatedDepartureTime) {
    return 'on';
  }

  // 夜間駐機便が出発していない
  if (a.number === '' && d.isEstimatedDepartureTime) {
    return 'on';
  }

  // 夜間駐機便が到着している
  if (!a.isEstimatedArrivalTime && d.number === '') {
    return 'on';
  }

  if (a.status === '着陸済み') {
    return 'in';
  }

  if (d.status === '出発済み') {
    return 'out';
  }

  return '';
}

export default ({}, inject) => {
  inject('fetchFlightData', fetchFlightData);
}
