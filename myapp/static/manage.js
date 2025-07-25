function postData(url, data, cb) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    })
    .then(cb)
    .catch((err) => {
      alert('Error saving');
      console.error(err);
    });
}

function saveExtra(key, item) {
  try {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(item);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to update stored ' + key, err);
  }
}

const BASE_COORDS = {
  Vancouver: { lat: 49.1939, lon: -123.1833 },
  Parksville: { lat: 49.3129, lon: -124.3686 },
  Kamloops: { lat: 50.7022, lon: -120.4443 },
  'Prince George': { lat: 53.8833, lon: -122.6783 },
  'Prince Rupert': { lat: 54.4685, lon: -128.5762 },
};

function haversineNM(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 0.539957;
}

function addPilot() {
  const name = document.getElementById('pilotName').value.trim();
  const weight = parseFloat(document.getElementById('pilotWeight').value);
  if (!name || isNaN(weight)) {
    alert('Please enter a name and weight');
    return;
  }
  postData('/addPilot', { name, weight }, () => {
    document.getElementById('pilotName').value = '';
    document.getElementById('pilotWeight').value = '';
    alert('Pilot saved');
    saveExtra('extraPilots', { name, weight });
  });
}

function addMedic() {
  const name = document.getElementById('medicName').value.trim();
  const weight = parseFloat(document.getElementById('medicWeight').value);
  if (!name || isNaN(weight)) {
    alert('Please enter a name and weight');
    return;
  }
  postData('/addMedic', { name, weight }, () => {
    document.getElementById('medicName').value = '';
    document.getElementById('medicWeight').value = '';
    alert('Medic saved');
    saveExtra('extraMedics', { name, weight });
  });
}

function addWaypoint() {
  const code = document.getElementById('waypointCode').value.trim();
  const name = document.getElementById('waypointName').value.trim();
  const regionText = document.getElementById('waypointRegion').value.trim();
  const lat = parseFloat(document.getElementById('waypointLat').value);
  const lon = parseFloat(document.getElementById('waypointLon').value);
  const elev = parseFloat(document.getElementById('waypointElev').value);
  if (!code || !name || isNaN(lat) || isNaN(lon) || isNaN(elev)) {
    alert('Please fill out all waypoint fields');
    return;
  }
  let regions = regionText ? regionText.split(',').map((r) => r.trim()) : [];
  if (!regions.includes('ALL')) regions.unshift('ALL');
  Object.entries(BASE_COORDS).forEach(([base, coords]) => {
    if (haversineNM(lat, lon, coords.lat, coords.lon) <= 200) {
      if (!regions.includes(base)) regions.push(base);
    }
  });
  postData('/addWaypoint', { code, name, regions, lat, lon, elev }, () => {
    document.getElementById('waypointCode').value = '';
    document.getElementById('waypointName').value = '';
    document.getElementById('waypointRegion').value = '';
    document.getElementById('waypointLat').value = '';
    document.getElementById('waypointLon').value = '';
    document.getElementById('waypointElev').value = '';
    alert('Waypoint saved');
    saveExtra('extraWaypoints', { code, name, regions, lat, lon, elev });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const pilotBtn = document.getElementById('savePilotBtn');
  const medicBtn = document.getElementById('saveMedicBtn');
  const wpBtn = document.getElementById('saveWaypointBtn');
  const backBtn = document.getElementById('backBtn');
  if (pilotBtn) pilotBtn.addEventListener('click', addPilot);
  if (medicBtn) medicBtn.addEventListener('click', addMedic);
  if (wpBtn) wpBtn.addEventListener('click', addWaypoint);
  if (backBtn) backBtn.addEventListener('click', () => {
    window.location.href = backBtn.dataset.href;
  });
});
