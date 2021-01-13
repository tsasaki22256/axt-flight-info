import axios from 'axios';

const numberPair = [
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

function getAirportName(id) {
  switch (id) {
    case 'odpt.Airport:CTS': return '新千歳';
    case 'odpt.Airport:HND': return '羽田';
    case 'odpt.Airport:ITM': return '伊丹';
    case 'odpt.Airport:NGO': return '名古屋';
  }
  return id;
}

function getFlightStatusTitle(status) {
  switch (status) {
    case 'odpt.FlightStatus:Adjusting': return '機材繰り';
    case 'odpt.FlightStatus:Arrived': return '到着済み';
    case 'odpt.FlightStatus:BaggageAvailable': return '手荷物引渡中';
    case 'odpt.FlightStatus:BoardingComplete': return '搭乗終了';
    case 'odpt.FlightStatus:Cancelled': return '欠航';
    case 'odpt.FlightStatus:CheckInClose': return '搭乗手続終了';
    case 'odpt.FlightStatus:CheckIn': return '搭乗手続中';
    case 'odpt.FlightStatus:Delayed': return '遅れ';
    case 'odpt.FlightStatus:Departed': return '出発済み';
    case 'odpt.FlightStatus:EstimatedArrival': return '到着予定';
    case 'odpt.FlightStatus:EstimatedDeparture': return '出発予定';
    case 'odpt.FlightStatus:FinalCall': return '最終搭乗案内';
    case 'odpt.FlightStatus:InAir': return '航行中';
    case 'odpt.FlightStatus:Indefinite': return '時刻未定';
    case 'odpt.FlightStatus:Landed': return '着陸済み';
    case 'odpt.FlightStatus:LateArrival': return '使用機遅れ';
    case 'odpt.FlightStatus:LeftGate': return 'ゲート出発済み';
    case 'odpt.FlightStatus:Maintenance': return '使用機整備';
    case 'odpt.FlightStatus:NewTime': return '時刻変更';
    case 'odpt.FlightStatus:NowBoarding': return '搭乗中';
    case 'odpt.FlightStatus:OnTime': return '定刻';
    case 'odpt.FlightStatus:Other': return 'その他';
    case 'odpt.FlightStatus:PostponedTomorrow': return '翌日運行';
    case 'odpt.FlightStatus:StopCheckIn': return '搭乗手続中止中';
    case 'odpt.FlightStatus:Takeoff': return '離陸済み';
    case 'odpt.FlightStatus:Unknown': return '不明';
    case 'odpt.FlightStatus:WeatherCheck': return '天候調査中';
    case 'odpt.FlightStatus:Yesterday': return '昨日便';
    case 'odpt.FlightStatus:DestinationChanged': return '到着地変更';
    case 'odpt.FlightStatus:BadWeather': return '天候不良';
  }
  return status;
}

async function updateFlightData(params) {
  const axios = params.axios;
  const arr = params.arr;
  const dep = params.dep;

  const ODPT_URL_FLIGHTINFOARR = 'https://api.odpt.org/api/v4/odpt:FlightInformationArrival';
  const ODPT_URL_FLIGHTINFODEP = 'https://api.odpt.org/api/v4/odpt:FlightInformationDeparture';

  const axArrToAxt = axios.$get(`${ODPT_URL_FLIGHTINFOARR}?odpt:arrivalAirport=odpt.Airport:AXT&acl:consumerKey=${params.consumerkey}`);
  const axDepToAxt = axios.$get(`${ODPT_URL_FLIGHTINFODEP}?odpt:destinationAirport=odpt.Airport:AXT&acl:consumerKey=${params.consumerkey}`);
  const axArrFromAxt = axios.$get(`${ODPT_URL_FLIGHTINFOARR}?odpt:originAirport=odpt.Airport:AXT&acl:consumerKey=${params.consumerkey}`);
  const axDepFromAxt = axios.$get(`${ODPT_URL_FLIGHTINFODEP}?odpt:departureAirport=odpt.Airport:AXT&acl:consumerKey=${params.consumerkey}`);
  
  const res1 = await axArrToAxt;
  const res2 = await axDepToAxt;
  const res3 = await axArrFromAxt;
  const res4 = await axDepFromAxt;

  let date = '';

  // 到着便

  for (let r of res1) {
    arr.push({
      airline: r['odpt:airline'] == 'odpt.Operator:ANA' ? 'ANA' : 'JAL',
      number: r['owl:sameAs'].replace(/^.+\.[A-Z]+/, ''),
      aircraftType: r['odpt:aircraftType'],
      origin: getAirportName(r['odpt:originAirport']),
      actualArrivalTime: r['odpt:estimatedArrivalTime'] || r['odpt:actualArrivalTime'],
      isEstimatedArrivalTime: r['odpt:estimatedArrivalTime'] ? true : false,
      scheduledArrivalTime: r['odpt:scheduledArrivalTime'],
      infoSummary: r['odpt:flightInformationSummary']?.ja,
      infoText: r['odpt:flightInformationText']?.ja,
      astatus: getFlightStatusTitle(r['odpt:flightStatus']),
      date: r['dc:date'],
    });
  }

  for (let r of res2) {
    const index = arr.findIndex(x => x.number === r['owl:sameAs'].replace(/^.+\.[A-Z]+/, ''));
    if (index !== -1) {
      arr[index].actualDepartureTime = r['odpt:estimatedDepartureTime'] || r['odpt:actualDepartureTime'];
      arr[index].scheduledDepartureTime = r['odpt:scheduledDepartureTime'];
      arr[index].isEstimatedDepartureTime = r['odpt:estimatedDepartureTime'] ? true : false;
      arr[index].dstatus = getFlightStatusTitle(r['odpt:flightStatus']);
      arr[index].date = arr[index].date < r['dc:date'] ? r['dc:date'] : arr[index].date;
    }
  }

  // 出発便

  for (let r of res3) {
    dep.push({
      airline: r['odpt:airline'] == 'odpt.Operator:ANA' ? 'ANA' : 'JAL',
      number: r['owl:sameAs'].replace(/^.+\.[A-Z]+/, ''),
      aircraftType: r['odpt:aircraftType'],
      destination: getAirportName(r['odpt:arrivalAirport']),
      actualArrivalTime: r['odpt:estimatedArrivalTime'] || r['odpt:actualArrivalTime'],
      isEstimatedArrivalTime: r['odpt:estimatedArrivalTime'] ? true : false,
      scheduledArrivalTime: r['odpt:scheduledArrivalTime'],
      astatus: getFlightStatusTitle(r['odpt:flightStatus']),
      date: r['dc:date'],
    });
  }

  for (let r of res4) {
    const index = dep.findIndex(x => x.number === r['owl:sameAs'].replace(/^.+\.[A-Z]+/, ''));
    if (index !== -1) {
      dep[index].actualDepartureTime = r['odpt:estimatedDepartureTime'] || r['odpt:actualDepartureTime'];
      dep[index].isEstimatedDepartureTime = r['odpt:estimatedDepartureTime'] ? true : false;
      dep[index].scheduledDepartureTime = r['odpt:scheduledDepartureTime'];
      dep[index].infoSummary = r['odpt:flightInformationSummary']?.ja;
      dep[index].infoText = r['odpt:flightInformationText']?.ja;
      dep[index].dstatus = getFlightStatusTitle(r['odpt:flightStatus']);
      dep[index].date = dep[index].date < r['dc:date'] ? r['dc:date'] : dep[index].date;
    }
  }

  // 最新の更新日時を取得
  for (let i = 0; i < arr.length; i++) {
    if (date < arr[i].date) {
      date = arr[i].date;
    }
  }

  for (let i = 0; i < dep.length; i++) {
    if (date < dep[i].date) {
      date = dep[i].date;
    }
  }

  // ステータス
  for (let i = 0; i < arr.length; i++) {
    arr[i].status = arr[i].astatus == '到着予定' ? arr[i].dstatus : arr[i].astatus;
    arr[i].cancelled = arr[i].status == '欠航';
  }

  for (let i = 0; i < dep.length; i++) {
    dep[i].status = dep[i].astatus == '到着予定' ? dep[i].dstatus : dep[i].astatus;
    dep[i].cancelled = dep[i].status == '欠航';
  }

  // 到着便の到着遅れ、出発便の出発遅れを計算
  for (let i = 0; i < arr.length; i++) {
    const at = arr[i].actualArrivalTime;
    const st = arr[i].scheduledArrivalTime;
    if (at && st) {
      arr[i].delayTime = ((new Date('2020/1/1 ' + at + ':00')) - (new Date('2020/1/1 ' + st + ':00'))) / 1000 / 60;
    }
  }

  for (let i = 0; i < dep.length; i++) {
    const at = dep[i].actualDepartureTime;
    const st = dep[i].scheduledDepartureTime;
    if (at && st) {
      dep[i].delayTime = ((new Date('2020/1/1 ' + at + ':00')) - (new Date('2020/1/1 ' + st + ':00'))) / 1000 / 60;
    }
  }

  // 時間でソート
  arr.sort((a, b) => a.scheduledArrivalTime > b.scheduledArrivalTime ? 1 : -1);
  dep.sort((a, b) => a.scheduledDepartureTime > b.scheduledDepartureTime ? 1 : -1);

  // 欠航便を無視した行インデックス
  for (let i = 0, x = 0; i < arr.length; i++) {
    arr[i].index2 = x;
    if (!arr[i].cancelled) {
      x++;
    }
  }

  for (let i = 0, x = 0; i < dep.length; i++) {
    dep[i].index2 = x;
    if (!dep[i].cancelled) {
      x++;
    }
  }

  // 機番をキーとして検索するための辞書
  const refArr = {};
  const refDep = {};

  for (let i = 0; i < arr.length; i++) {
    refArr[arr[i].number] = arr[i];
  }

  for (let i = 0; i < dep.length; i++) {
    refDep[dep[i].number] = dep[i];
  }

  // 空のオブジェクト
  const emptyData = {
    airline: '',
    number: '',
    aircraftType: '',
    origin: '',
    actualArrivalTime: '',
    isEstimatedArrivalTime: false,
    scheduledArrivalTime: '',
    infoSummary: '',
    infoText: '',
    astatus: '',
    actualDepartureTime: '',
    isEstimatedDepartureTime: false,
    scheduledDepartureTime: '',
    infoSummary: '',
    infoText: '',
    dstatus: '',
    date: '',
    status: '',
    delayTime: 0,
    cancelled: false,
  };

  // 到着便・出発便を結合したデータを作成
  for (let i = 0; i < numberPair.length; i++) {
    const numa = numberPair[i][0];
    if (numa === '') continue;

    const numd = numberPair[i][1];
    const refa = (numa === '') ? Object.assign({}, emptyData) : refArr[numa];
    const refd = (numd === '') ? Object.assign({}, emptyData) : refDep[numd];

    params.comb.push({
      arr: refa,
      dep: refd,
    });
  }

  // ソート
  params.comb.sort((a, b) => a.arr.scheduledArrivalTime > b.arr.scheduledArrivalTime ? 1 : -1);

  // 始発便
  const comb2 = [];
  for (let i = 0; i < numberPair.length; i++) {
    const numa = numberPair[i][0];
    if (numa !== '') continue;

    const numd = numberPair[i][1];
    const refa = (numa === '') ? Object.assign({}, emptyData) : refArr[numa];
    const refd = (numd === '') ? Object.assign({}, emptyData) : refDep[numd];

    comb2.push({
      arr: refa,
      dep: refd,
    });
  }

  // ソート
  comb2.sort((a, b) => a.dep.scheduledDepartureTime > b.dep.scheduledDepartureTime ? 1 : -1);

  params.comb = [...comb2, ...params.comb];

  // データ取得日時
  params.date = new Date(date).toLocaleString();

  // 時間
  const m = params.date.match(/([0-9]+:[0-9]+):[0-9]+/);
  if (m) {
    params.time = m[1];
  }
}

export default ({}, inject) => {
  inject('getAirportName', getAirportName);
  inject('getFlightStatusTitle', getFlightStatusTitle);
  inject('updateFlightData', updateFlightData);
}
