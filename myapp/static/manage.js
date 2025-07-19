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
  if (!code || !name || !regionText || isNaN(lat) || isNaN(lon)) {
    alert('Please fill out all waypoint fields');
    return;
  }
  const regions = regionText.split(',').map(r => r.trim());
  postData('/addWaypoint', { code, name, regions, lat, lon }, () => {
    document.getElementById('waypointCode').value = '';
    document.getElementById('waypointName').value = '';
    document.getElementById('waypointRegion').value = '';
    document.getElementById('waypointLat').value = '';
    document.getElementById('waypointLon').value = '';
    alert('Waypoint saved');
    saveExtra('extraWaypoints', { code, name, regions, lat, lon });
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
