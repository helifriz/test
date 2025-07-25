import * as data from './data.js';
import * as ui from './ui.js';
import * as route from './route.js';

async function start() {
  await data.fetchData();
  data.loadExtraPilots();
  data.loadExtraMedics();
  data.loadExtraWaypoints();
  ui.setupWaypointInputs();
  data.populatePilotDropdowns();
  data.loadBaseSelection();
  ui.populateAllDropdowns();
  ui.disableDuplicatePilot();
  data.populateHelicopterDropdown();
  data.loadCrewSelection();
  data.loadFlightConfig();
  document.querySelectorAll('.leg-row').forEach(ui.attachRemoveHandler);

  const qs = (id) => document.getElementById(id);
  const mapping = [
    ['addLegBtn', 'click', ui.addLeg],
    ['calcBtn', 'click', route.calculateRoute],
    ['foreflightBtn', 'click', route.openForeFlight],
    ['windyBtn', 'click', route.openWindy],
    ['googleBtn', 'click', route.openGoogleMaps],
    ['metarBtn', 'click', route.openMetarTaf],
    ['wxbriefBtn', 'click', route.openWxBrief],
    ['skyvectorBtn', 'click', route.openSkyVector],
    ['emailBtn', 'click', route.composeEmail],
    ['printBtn', 'click', route.printFlightLog],
    ['manageBtn', 'click', (e) => (window.location.href = e.target.dataset.href)],
    ['region-select', 'change', ui.populateAllDropdowns],
    ['region-select', 'change', data.saveBaseSelection],
    ['helicopter', 'change', data.saveCrewSelection],
    ['leftPilot', 'input', data.saveCrewSelection],
    ['rightPilot', 'input', data.saveCrewSelection],
    ['seat1a', 'input', data.saveCrewSelection],
    ['seat2a', 'input', data.saveCrewSelection],
    ['seat1c', 'input', data.saveCrewSelection],
    ['speed', 'input', data.saveFlightConfig],
    ['fuel', 'input', data.saveFlightConfig],
    ['startFuel', 'input', data.saveFlightConfig],
  ];
  mapping.forEach(([id, evt, fn]) => {
    const el = qs(id);
    if (el) el.addEventListener(evt, fn);
  });

  ['leftPilot', 'rightPilot'].forEach((id) => {
    const input = qs(id);
    if (input) {
      ui.setupPilotSearch(id);
      input.addEventListener('input', ui.disableDuplicatePilot);
    }
  });
  ['seat1a', 'seat2a', 'seat1c'].forEach((id) => {
    const input = qs(id);
    if (input) {
      ui.setupMedicSearch(id);
      input.addEventListener('input', ui.disableDuplicateMedic);
    }
  });
}

document.addEventListener('DOMContentLoaded', start);
