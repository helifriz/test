const HELICOPTERS = [
  { reg: "C-GHIV", weight: 3692 },
  { reg: "C-GHBB", weight: 3821 },
  { reg: "C-GHCC", weight: 3700 },
  { reg: "C-GHDD", weight: 3845 },
];

const MAX_FUEL = 904; // maximum usable fuel in kg
const MIN_FUEL = 100; // minimum fuel in kg
const MAX_TAKEOFF_WEIGHT = 4800; // maximum takeoff weight in kg

  // decimal‑degrees (DD)
const waypoints = {
  // VANCOUVER REGION
  CAB5: {
    name: "Abbotsford Hospital",
    regions: ["Vancouver", "ALL"],
    lat: 49.0361,
    lon: -122.3141,
  },
  CYXX: {
    name: "Abbotsford",
    regions: ["Vancouver", "ALL"],
    lat: 49.0253,
    lon: -122.3600,
  },
  BIS: {
    name: "Bowen Island",
    regions: ["Vancouver", "ALL"],
    lat: 49.3775,
    lon: -123.335,
  },
  BIG: {
    name: "Bowen Island (Golf)",
    regions: ["Vancouver", "ALL"],
    lat: 49.3408,
    lon: -123.3605,
  },
  CFR6: {
    name: "Coquitlam Fire & Rescue",
    regions: ["Vancouver", "ALL"],
    lat: 49.2916,
    lon: -122.7922,
  },
  CBL7: {
    name: "Cortes Island",
    regions: ["Vancouver", "Parksville", "ALL"],
    lat: 50.0586,
    lon: -124.9820,
  },
  CAK3: {
    name: "Delta Heritage",
    regions: ["Vancouver", "ALL"],
    lat: 49.0781,
    lon: -122.9381,
  },
  CAF6: {
    name: "Big Bay",
    regions: ["Vancouver", "Parksville", "ALL"],
    lat: 50.3921,
    lon: -125.1369,
  },
  CAG6: {
    name: "Blind Channel",
    regions: ["Vancouver", "Parksville", "ALL"],
    lat: 50.4132,
    lon: -125.5017,
  },
  CAP3: {
    name: "Sechelt",
    regions: ["Vancouver", "ALL"],
    lat: 49.4603,
    lon: -123.7168,
  },
  CYNJ: {
    name: "Langley",
    regions: ["Vancouver", "ALL"],
    lat: 49.1008,
    lon: -122.6306,
  },
  CZBB: {
    name: "Boundary Bay",
    regions: ["Vancouver", "ALL"],
    lat: 49.0779,
    lon: -123.0071,
  },
  CYVR: {
    name: "Vancouver",
    regions: ["Vancouver", "ALL"],
    lat: 49.1939,
    lon: -123.1833,
  },
  CBC7: {
    name: "Vancouver Harbour Heliport",
    regions: ["Vancouver", "ALL"],
    lat: 49.2869,
    lon: -123.1061,
  },
  CYPK: {
    name: "Pitt Meadows",
    regions: ["Vancouver", "ALL"],
    lat: 49.2161,
    lon: -122.7086,
  },

  // PARKSVILLE REGION //
  CAT6: {
    name: "Campbell River Hospital",
    regions: ["Parksville", "ALL"],
    lat: 50.0086,
    lon: -125.2427,
  },
  CYAL: {
    name: "Alert Bay",
    regions: ["Parksville", "ALL"],
    lat: 50.5822,
    lon: -126.9158,
  },
  CAH3: {
    name: "Courtenay Airpark",
    regions: ["Parksville", "ALL"],
    lat: 49.6794,
    lon: -124.9816,
  },
  WCR: {
    name: "Campbell River SPIT",
    regions: ["Parksville", "ALL"],
    lat: 50.0452,
    lon: -125.2536,
  },
  CBV8: {
    name: "Comox Valley Hospital",
    regions: ["Parksville", "ALL"],
    lat: 49.7122,
    lon: -124.9694,
  },
  BAP: {
    name: "Bamfield",
    regions: ["Parksville", "ALL"],
    lat: 48.8227,
    lon: -125.1177,
  },
  CWS: {
    name: "Chemainus",
    regions: ["Parksville", "ALL"],
    lat: 48.9183,
    lon: -123.7106,
  },
  CDD: {
    name: "Colwood DND",
    regions: ["Parksville", "ALL"],
    lat: 48.4481,
    lon: -123.4541,
  },
  CYCD: {
    name: "Nanaimo",
    regions: ["Parksville", "ALL"],
    lat: 49.0556,
    lon: -123.8697,
  },
  CYAZ: {
    name: "Tofino",
    regions: ["Parksville", "ALL"],
    lat: 49.0759,
    lon: -125.77,
  },
  CYWH: {
    name: "Victoria Inner Harbour",
    regions: ["Parksville", "ALL"],
    lat: 48.4308,
    lon: -123.4317,
  },
  CYYJ: {
    name: "Victoria International",
    regions: ["Parksville", "ALL"],
    lat: 48.6469,
    lon: -123.4269,
  },
  CAT4: {
    name: "Qualicum",
    regions: ["Parksville", "ALL"],
    lat: 49.3394,
    lon: -124.3965,
  },

  // KAMLOOPS REGION
  AHL: {
    name: "Ashcroft Hospital",
    regions: ["Kamloops", "ALL"],
    lat: 50.735,
    lon: -121.281,
  },
  CYYF: {
    name: "Penticton",
    regions: ["Kamloops", "ALL"],
    lat: 49.4631,
    lon: -119.6017,
  },
  CQV3: {
    name: "Queen Victoria",
    regions: ["Kamloops", "ALL"],
    lat: 50.9776,
    lon: -118.1893,
  },
  CYLW: {
    name: "Kelowna International",
    regions: ["Kamloops", "ALL"],
    lat: 49.9561,
    lon: -119.3772,
  },
  CYCG: {
    name: "West Kootenay Regional",
    regions: ["Kamloops", "ALL"],
    lat: 49.2964,
    lon: -117.6325,
  },

  // PRINCE GEORGE REGION
  CAJ4: {
    name: "Anahim Lake",
    regions: ["Prince George", "ALL"],
    lat: 52.4516,
    lon: -125.3050,
  },
  CAV3: {
  name: "100 Mile House",
  regions: ["Prince George", "ALL"],
  lat: 51.6433,
  lon: -121.3066,
  },
  CYBD: {
    name: "Bella Coola Heliport",
    regions: ["Prince George", "ALL"],
    lat: 52.3875,
    lon: -126.5958,
  },
  CYPZ: {
    name: "Burns Lake",
    regions: ["Prince George", "ALL"],
    lat: 54.3772,
    lon: -125.9526,
  },
  CYJM: {
    name: "Fort St James",
    regions: ["Prince George", "ALL"],
    lat: 54.3966,
    lon: -124.2633,
  },
  CBZ9: {
    name: "Fraser Lake",
    regions: ["Prince George", "ALL"],
    lat: 54.0133,
    lon: -124.7683,
  },
  CYZY: {
    name: "Mackenzie",
    regions: ["Prince George", "ALL"],
    lat: 55.2994,
    lon: -123.1333,
  },
  CAV4: {
    name: "McBride",
    regions: ["Prince George", "ALL"],
    lat: 53.315,
    lon: -120.17,
  },
  CYXT: {
    name: "Northwest Terrace",
    regions: ["Prince Rupert", "ALL"],
    lat: 54.4685,
    lon: -128.5762,
  },
  CBN9: {
    name: "Tsay Keh",
    regions: ["Prince George", "ALL"],
    lat: 56.9066,
    lon: -124.9666,
  },
  CBX7: {
    name: "Tumbler Ridge",
    regions: ["Prince George", "ALL"],
    lat: 55.0266,
    lon: -120.9316,
  },
  CAU4: {
    name: "Vanderhoof",
    regions: ["Prince George", "ALL"],
    lat: 54.0466,
    lon: -124.0116,
  },
  CYXS: {
    name: "Prince George",
    regions: ["Prince George", "ALL"],
    lat: 53.8833,
    lon: -122.6783,
  },
  CYYD: {
    name: "Smithers",
    regions: ["Prince George", "ALL"],
    lat: 54.8247,
    lon: -127.1828,
  },
  CYZP: {
    name: "Sandspit",
    regions: ["Prince Rupert", "ALL"],
    lat: 53.2543,
    lon: -131.8138,
  },
};

const PILOTS = [
  { name: "Alice Smith", weight: 78 },
  { name: "Bob Jones", weight: 90 },
  { name: "Charlie Lee", weight: 83 },
  { name: "Dana White", weight: 74 },
];

const MEDICS = [
  { name: "Std Female", weight: 80 },
  { name: "Std Male", weight: 96 },
  { name: "Alice Rose", weight: 78 },
  { name: "Bob Lee", weight: 90 },
  { name: "Charlie Pain", weight: 83 },
  { name: "Dana Black", weight: 74 },
];