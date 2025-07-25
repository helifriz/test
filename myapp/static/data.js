
export let HELICOPTERS = [];
export let MAX_FUEL = 0;
export let MIN_FUEL = 0;
export let MAX_TAKEOFF_WEIGHT = 0;
export let waypoints = {};
export let PILOTS = [];
export let MEDICS = [];

export const CREW_KEY = 'crewSelection';
export const CONFIG_KEY = 'flightConfig';
export const BASE_KEY = 'baseSelection';

export async function fetchData() {
  try {
    const res = await fetch('/data');
    const data = await res.json();
    HELICOPTERS = data.HELICOPTERS;
    MAX_FUEL = data.MAX_FUEL;
    MIN_FUEL = data.MIN_FUEL;
    MAX_TAKEOFF_WEIGHT = data.MAX_TAKEOFF_WEIGHT;
    waypoints = data.waypoints || {};
    PILOTS = data.PILOTS;
    MEDICS = data.MEDICS;
  } catch (err) {
    console.error('Failed to fetch data from server', err);
  }
}

export const BASE_COORDS = {
  "Vancouver": { lat: 49.1939, lon: -123.1833 },
  "Parksville": { lat: 49.3129, lon: -124.3686 },
  "Kamloops": { lat: 50.7022, lon: -120.4443 },
  "Prince George": { lat: 53.8833, lon: -122.6783 },
  "Prince Rupert": { lat: 54.4685, lon: -128.5762 },
};

function loadStoredList(key, target, prop) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.forEach((item) => {
      if (!target.some((existing) => existing[prop] === item[prop])) {
        target.push(item);
      }
    });
  } catch (err) {
    console.error('Failed to load stored ' + key, err);
  }
}

export function loadExtraPilots() {
  loadStoredList('extraPilots', PILOTS, 'name');
}

export function loadExtraMedics() {
  loadStoredList('extraMedics', MEDICS, 'name');
}

export function loadExtraWaypoints() {
  try {
    const stored = JSON.parse(localStorage.getItem('extraWaypoints') || '[]');
    stored.forEach((wp) => {
      if (!waypoints[wp.code]) {
        waypoints[wp.code] = {
          name: wp.name,
          regions: wp.regions,
          lat: wp.lat,
          lon: wp.lon,
        };
      }
    });
  } catch (err) {
    console.error('Failed to load stored waypoints', err);
  }
}

window.addEventListener('storage', (e) => {
  if (e.key === 'extraPilots') {
    loadExtraPilots();
    populatePilotDropdowns();
      } else if (e.key === 'extraMedics') {
    loadExtraMedics();
  } else if (e.key === 'extraWaypoints') {
    loadExtraWaypoints();
    populateAllDropdowns();
  } else if (e.key === CREW_KEY) {
    loadCrewSelection();
  } else if (e.key === CONFIG_KEY) {
    loadFlightConfig();
  } else if (e.key === BASE_KEY) {
    loadBaseSelection();
  }
});

export function populateHelicopterDropdown() {
  const heliSelect = document.getElementById("helicopter");
  heliSelect.innerHTML = "";

  // Add placeholder
  const placeholder = new Option("Select Helicopter", "");
  heliSelect.add(placeholder);

  // Add helicopters by reg only (no weight shown)
  HELICOPTERS.forEach((heli) => {
    const option = new Option(heli.reg, heli.reg);
    heliSelect.add(option);
  });
}
export function populatePilotDropdowns() {
  document.getElementById("leftPilot").value = "";
  document.getElementById("rightPilot").value = "";
}

export function saveCrewSelection() {
  try {
    const data = {
      helicopter: document.getElementById('helicopter').value,
      leftPilot: document.getElementById('leftPilot').value,
      rightPilot: document.getElementById('rightPilot').value,
      seat1a: document.getElementById('seat1a').value,
      seat2a: document.getElementById('seat2a').value,
      seat1c: document.getElementById('seat1c').value,
    };
    localStorage.setItem(CREW_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to store crew selection', err);
  }
}

export function loadCrewSelection() {
  try {
    const stored = JSON.parse(localStorage.getItem(CREW_KEY) || '{}');
    if (stored.helicopter) {
      const heliSelect = document.getElementById('helicopter');
      heliSelect.value = stored.helicopter;
    }
    const ids = ['leftPilot','rightPilot','seat1a','seat2a','seat1c'];
    ids.forEach((id) => {
      if (stored[id]) {
        const input = document.getElementById(id);
        input.value = stored[id];
      }
    });
    disableDuplicatePilot();
    ['seat1a','seat2a','seat1c'].forEach((id) => {
      disableDuplicateMedic({ target: document.getElementById(id) });
    });
  } catch (err) {
    console.error('Failed to load crew selection', err);
  }
}

export function saveFlightConfig() {
  try {
    const data = {
      speed: document.getElementById('speed').value,
      fuelBurn: document.getElementById('fuel').value,
      startFuel: document.getElementById('startFuel').value,
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to store flight config', err);
  }
}

export function loadFlightConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    if (stored.speed) document.getElementById('speed').value = stored.speed;
    if (stored.fuelBurn) document.getElementById('fuel').value = stored.fuelBurn;
    if (stored.startFuel)
      document.getElementById('startFuel').value = stored.startFuel;
  } catch (err) {
    console.error('Failed to load flight config', err);
  }
}

export function saveBaseSelection() {
  try {
    const base = document.getElementById('region-select').value;
    localStorage.setItem(BASE_KEY, base);
  } catch (err) {
    console.error('Failed to store base selection', err);
  }
}

export function loadBaseSelection() {
  try {
    const stored = localStorage.getItem(BASE_KEY);
    if (stored) {
      document.getElementById('region-select').value = stored;
      populateAllDropdowns();
    }
  } catch (err) {
    console.error('Failed to load base selection', err);
  }
}

