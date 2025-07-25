import { waypoints, PILOTS, MEDICS, HELICOPTERS, MIN_FUEL, MAX_FUEL, MAX_TAKEOFF_WEIGHT } from "./data.js";
export let latestLegWeights = [];
export let latestWeightTable = "";
export let latestRouteTable = "";
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(
    R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.539957,
  );
}
export function calculateRoute() {
  // Ensure at least one leg has valid waypoints before calculating
  const hasWaypoints = Array.from(document.querySelectorAll('.leg-row')).some(
    (leg) => {
      const fromSel = leg.querySelector('.from');
      const toSel = leg.querySelector('.to');
      const fromCode = fromSel.dataset.code || fromSel.value.split(/[\s-]/)[0];
      const toCode = toSel.dataset.code || toSel.value.split(/[\s-]/)[0];
      if (!fromCode || !toCode) return false;
      if (fromCode === 'SCENE') {
        const lat = leg.querySelector('.from-lat').value;
        const lon = leg.querySelector('.from-lon').value;
        if (!lat || !lon) return false;
      }
      if (toCode === 'SCENE') {
        const lat = leg.querySelector('.to-lat').value;
        const lon = leg.querySelector('.to-lon').value;
        if (!lat || !lon) return false;
      }
      return true;
    },
  );
  if (!hasWaypoints) {
    alert('Please enter at least one complete leg before calculating the route.');
    return;
  }
  const cruise = parseFloat(document.getElementById("speed").value);
  const burn = parseFloat(document.getElementById("fuel").value);
  const startFuelInput = document.getElementById("startFuel");
  let fuel = parseFloat(startFuelInput.value);
  const initialFuel = fuel;
  const errors = [];
  if (isNaN(fuel)) {
    errors.push("Start fuel must be a number");
    fuel = 0;
  } else if (fuel < MIN_FUEL) {
    alert(`Start fuel below ${MIN_FUEL} kg (~20 min)`);
    errors.push(`Start fuel must be at least ${MIN_FUEL} kg (~20 min)`);
  } else if (fuel > MAX_FUEL) {
    alert(`Start fuel must not exceed ${MAX_FUEL} kg`);
    errors.push(`Start fuel must not exceed ${MAX_FUEL} kg`);
  }
  const seat1aName = document.getElementById("seat1a").value;
  const seat2aName = document.getElementById("seat2a").value;
  const seat1cName = document.getElementById("seat1c").value;
  const seat1a = MEDICS.find((m) => m.name === seat1aName)?.weight || 0;
  const seat2a = MEDICS.find((m) => m.name === seat2aName)?.weight || 0;
  const seat1c = MEDICS.find((m) => m.name === seat1cName)?.weight || 0;
  const baggage = parseFloat(document.getElementById("baggage").value) || 0;
  // These are global patient/escort weights
  const patientVal = document.getElementById("patient").value;
  const escortVal = document.getElementById("escort").value;
  const globalPatientWeight = parseFloat(patientVal) || 0;
  const globalEscortWeight = parseFloat(escortVal) || 0;

  const patientRequired = Array.from(
    document.querySelectorAll(".patient-checkbox"),
  ).some((cb) => cb.checked);
  const escortRequired = Array.from(
    document.querySelectorAll(".escort-checkbox"),
  ).some((cb) => cb.checked);

  if (patientRequired && (!patientVal || parseFloat(patientVal) <= 0)) {
    alert("Patient weight is required when the patient checkbox is selected");
    errors.push(
      "Patient weight is required when the patient checkbox is selected",
    );
  }

  if (escortRequired && (!escortVal || parseFloat(escortVal) <= 0)) {
    alert("Escort weight is required when the escort checkbox is selected");
    errors.push(
      "Escort weight is required when the escort checkbox is selected",
    );
  }
  const selectedHeli = document.getElementById("helicopter").value;
  const heliWeight =
    HELICOPTERS.find((h) => h.reg === selectedHeli)?.weight || 0;
  const leftPilotName = document.getElementById("leftPilot").value;
  const rightPilotName = document.getElementById("rightPilot").value;
  const leftWeight = PILOTS.find((p) => p.name === leftPilotName)?.weight || 0;
  const rightWeight =
    PILOTS.find((p) => p.name === rightPilotName)?.weight || 0;
  let dist = 0,
    mins = 0,
    totalFuel = 0,
    lastWeight = 0;
    
// Route Table //

  let table = `
<table class="route-table tableizer-table">
  <thead>
  <tr>
    <th rowspan="2">Leg</th>
    <th rowspan="2">From ➝ To</th>
    <th rowspan="2">Dest Elev</th>
    <th rowspan="2">Track</th>
    <th rowspan="2">NM</th>
    <th rowspan="2">Time</th>
    <th colspan="2">Fuel (kg)</th>
    <th colspan="2">Est Uplift</th>
    <th rowspan="2">Takeoff Kg</th>
    <th rowspan="2" colspan="2" >Twilight</th>
  </tr>
  <tr>
    <th>Depart</th>
    <th>Dest</th>
    <th>Kg</th>
    <th>Ltr</th>
  </tr>
</thead>
  <tbody>
`;
  const legWeights = [];
  let finalDestinationFuel = fuel;
    document.querySelectorAll(".leg-row").forEach((leg, i) => {
      const fromSel = leg.querySelector(".from");
      const toSel = leg.querySelector(".to");
      const fromCode = fromSel.dataset.code || fromSel.value.split(/[\s-]/)[0];
      const toCode = toSel.dataset.code || toSel.value.split(/[\s-]/)[0];
      if (!fromCode || !toCode) return;
      let fLat, fLon, tLat, tLon, fName, tName;
      if (fromCode === "SCENE") {
        fLat = parseFloat(leg.querySelector(".from-lat").value);
        fLon = parseFloat(leg.querySelector(".from-lon").value);
        fName = `SCENE (${fLat}, ${fLon})`;
      } else {
        const f = waypoints[fromCode];
        fLat = f.lat;
        fLon = f.lon;
        fName = f.name;
      }
      if (toCode === "SCENE") {
        tLat = parseFloat(leg.querySelector(".to-lat").value);
        tLon = parseFloat(leg.querySelector(".to-lon").value);
        tName = `SCENE (${tLat}, ${tLon})`;
      } else {
        const t = waypoints[toCode];
        tLat = t.lat;
        tLon = t.lon;
        tName = t.name;
      }
    const d = haversine(fLat, fLon, tLat, tLon);
    const h =
      Math.round(
        Math.atan2(
          Math.sin(((tLon - fLon) * Math.PI) / 180) *
            Math.cos((tLat * Math.PI) / 180),
          Math.cos((fLat * Math.PI) / 180) * Math.sin((tLat * Math.PI) / 180) -
            Math.sin((fLat * Math.PI) / 180) *
              Math.cos((tLat * Math.PI) / 180) *
              Math.cos(((tLon - fLon) * Math.PI) / 180),
        ) *
          (180 / Math.PI) +
          360,
      ) % 360;
    const timeHr = d / cruise;
    const min = Math.round(timeHr * 60);
    const legFuel = Math.round(timeHr * burn);
    // These now refer to the current leg:
    const patientIncluded = leg.querySelector(".patient-checkbox")?.checked;
    const escortIncluded = leg.querySelector(".escort-checkbox")?.checked;
    const fuelUp = parseFloat(leg.querySelector(".legfuel")?.value) || 0;
    const patientWeight = patientIncluded ? globalPatientWeight : 0;
    const escortWeight = escortIncluded ? globalEscortWeight : 0;
    // Weight before burning leg fuel
    const departureFuel = fuel;
    const totalWeight =
      heliWeight +
      departureFuel +
      leftWeight +
      rightWeight +
      seat1a +
      seat2a +
      seat1c +
      baggage +
      patientWeight +
      escortWeight;
    if (totalWeight > MAX_TAKEOFF_WEIGHT) {
      alert(`Takeoff weight exceeds ${MAX_TAKEOFF_WEIGHT} kg on leg ${i + 1}`);
      errors.push(
        `Takeoff weight exceeds ${MAX_TAKEOFF_WEIGHT} kg on leg ${i + 1}`,
      );
    }
    lastWeight = totalWeight;
    // Calculate destination fuel then apply uplift
    fuel -= legFuel;
    const destinationFuel = fuel;
    finalDestinationFuel = destinationFuel;
    let lowFuelWarningShown = false;
    if (destinationFuel < MIN_FUEL) {
      alert(
        `Fuel level at destination must be at least ${MIN_FUEL} kg on leg ${i + 1}`,
      );
      errors.push(
        `Fuel level at destination must be at least ${MIN_FUEL} kg on leg ${i + 1}`,
      );
      lowFuelWarningShown = true;
    }
    fuel += fuelUp;
    if (fuel < MIN_FUEL && !lowFuelWarningShown) {
      alert(`Fuel level below ${MIN_FUEL} kg (~20 min) on leg ${i + 2}`);
      errors.push(
        `Fuel level must be at least ${MIN_FUEL} kg (~20 min) on leg ${i + 2}`,
      );
    } else if (fuel > MAX_FUEL) {
      alert(`Fuel level must not exceed ${MAX_FUEL} kg on leg ${i + 2}`);
      errors.push(`Fuel level must not exceed ${MAX_FUEL} kg on leg ${i + 2}`);
    }
    dist += d;
    mins += min;
    totalFuel += legFuel;
    const upliftLitres = fuelUp ? Math.round(fuelUp / 0.8) : "";
    const destElev =
      toCode !== "SCENE" && waypoints[toCode] && waypoints[toCode].elev !== undefined
        ? waypoints[toCode].elev
        : "";
    const twilight = getCivilTwilightAt(fLat, fLon);
    table += `<tr>
      <td>${i + 1}</td>
      <td>${fName} ➝ ${tName}</td>
      <td>${destElev}</td>
      <td>${h.toString().padStart(3, "0")}°</td>
      <td>${d}</td>
      <td>${Math.floor(min / 60)}h ${min % 60}m</td>
      <td>${departureFuel}</td>
      <td>${destinationFuel}</td>
      <td>${fuelUp || ""}</td>
      <td>${upliftLitres}</td>
      <td>${totalWeight}</td>
      <td>${twilight.dawn}</td>
      <td>${twilight.dusk}</td>
    </tr>`;
    const seat2aTotal = seat2a + escortWeight;
    const zfw =
      heliWeight +
      leftWeight +
      rightWeight +
      seat1a +
      seat2aTotal +
      seat1c +
      patientWeight +
      baggage;
    legWeights.push({
      heliWeight,
      leftWeight,
      rightWeight,
      seat1a,
      seat2aTotal,
      seat1c,
      patientWeight,
      baggage,
      zfw,
    });
  });
  table += `<tr>
    <th colspan="2">TOTAL</th>
    <th></th><th>-</th><th>${dist}</th>
    <th>${Math.floor(mins / 60)}h ${mins % 60}m</th>
    <th>-</th><th>-</th><th>-</th><th>-</th><th>-</th>
  </tr></table>`;
  
// Leg Weight Table//

  let weightTable =
    '<table class="weight-table tableizer-table"><thead><tr><th></th>';
  legWeights.forEach((_, idx) => {
    weightTable += `<th>Leg ${idx + 1}</th>`;
  });
  weightTable += "</tr></thead><tbody>";
  const addRow = (label, key) => {
    weightTable += `<tr><th>${label}</th>`;
    legWeights.forEach((w) => {
      if (key) {
        weightTable += `<td>${w[key]}</td>`;
      } else {
        weightTable += "<td></td>";
      }
    });
    weightTable += "</tr>";
  };
  addRow("Empty", "heliWeight");
  addRow("Left Seat", "leftWeight");
  addRow("Right Seat", "rightWeight");
  addRow("1A", "seat1a");
  addRow("2A", "seat2aTotal");
  addRow("1C", "seat1c");
  addRow("Stretcher", "patientWeight");
  addRow("Baggage", "baggage");
  addRow("ZFW", "zfw");
  addRow("Start Fuel");
  addRow("TOGW");
  weightTable += "</tbody></table>";
  latestLegWeights = legWeights;
  latestWeightTable = weightTable;
  latestRouteTable = table;
  document.getElementById("result").innerHTML = table;
  document.getElementById("weightTable").innerHTML = "";
  document.getElementById("errors").innerHTML = errors.join("<br>");
}
export function getPoints() {
  const points = [];
  document.querySelectorAll(".leg-row").forEach((leg, idx) => {
    const fromSel = leg.querySelector(".from");
    const toSel = leg.querySelector(".to");
    const fromCode = fromSel.dataset.code || fromSel.value.split(/[\s-]/)[0];
    const toCode = toSel.dataset.code || toSel.value.split(/[\s-]/)[0];
    if (!fromCode || !toCode) return;
    if (idx === 0) points.push(extractPoint(leg, "from", fromCode));
    points.push(extractPoint(leg, "to", toCode));
  });
  return points;
  function extractPoint(leg, prefix, code) {
    if (code === "SCENE") {
      const latInput = leg.querySelector("." + prefix + "-lat");
      const lonInput = leg.querySelector("." + prefix + "-lon");
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Scene latitude and longitude are required");
      }
      return { lat, lon, original: code };
    }
    const wp = waypoints[code];
    return { lat: wp.lat, lon: wp.lon, original: code };
  }
}

export function getBaseCoords() {
  const base = document.getElementById("region-select").value;
  if (base !== "ALL" && BASE_COORDS[base]) {
    return BASE_COORDS[base];
  }
  const firstLeg = document.querySelector(".leg-row");
  if (!firstLeg) return null;
  const fromSel = firstLeg.querySelector(".from");
  const code = fromSel.dataset.code || fromSel.value.split(/[\s-]/)[0];
  if (!code) return null;
  if (code === "SCENE") {
    const lat = parseFloat(firstLeg.querySelector(".from-lat").value);
    const lon = parseFloat(firstLeg.querySelector(".from-lon").value);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
    return null;
  }
  const wp = waypoints[code];
  return wp ? { lat: wp.lat, lon: wp.lon } : null;
}

export function getCivilTwilight() {
  const coords = getBaseCoords();
  if (!coords || typeof SunCalc === "undefined") return null;
  const times = SunCalc.getTimes(new Date(), coords.lat, coords.lon);
  const tz = "America/Vancouver";
  const fmt = (d) =>
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
      hour12: false,
    });
  return { dawn: fmt(times.dawn), dusk: fmt(times.dusk) };
}

export function getCivilTwilightAt(lat, lon) {
  if (typeof SunCalc === "undefined") return { dawn: "", dusk: "" };
  const times = SunCalc.getTimes(new Date(), lat, lon);
  const tz = "America/Vancouver";
  const fmt = (d) =>
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tz,
      hour12: false,
    });
  return { dawn: fmt(times.dawn), dusk: fmt(times.dusk) };
}

export function openWindy() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build a Windy link");
      return;
    }
    const windyRouteStr = points.map((p) => `${p.lat},${p.lon}`).join(";");
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length;
    const windyURL = `https://www.windy.com/route-planner/vfr/${encodeURIComponent(windyRouteStr)}?layer=radar,${avgLat.toFixed(4)},${avgLon.toFixed(4)},7,p:cities`;
    window.open(windyURL, "_blank");
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to open Windy");
  }
}

export function openMetarTaf() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build a METAR-TAF link");
      return;
    }
    const fromPoint = points[0];
    const latInt = Math.round(fromPoint.lat * 10000);
    const lonInt = Math.round(fromPoint.lon * 10000);
    const isICAO = /^[A-Z]{4}$/.test(fromPoint.original);
    const hl = isICAO ? fromPoint.original : "";
    const metarURL = `https://metar-taf.com/?c=${latInt}.${lonInt}&hl=${hl}`;
    window.open(metarURL, "_blank");
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to open METAR-TAF");
  }
}

export function openWxBrief() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build a WxBrief link");
      return;
    }
    const wxPoints = points
      .map((p) => {
        const ident = p.original || "";
        const lon = p.lon.toFixed(3);
        const lat = p.lat.toFixed(3);
        return `point=${encodeURIComponent(`${ident}|site|${lon},${lat}`)}`;
      })
      .join("&");
    const wxBriefURL =
      `https://wxbrief.ca/?${wxPoints}&routeRadius=20&metar=true&taf=true&gfaWx=true&gfaTurb=true&live=true`;
    window.open(wxBriefURL, "_blank");
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to open WxBrief");
  }
}

export function openGoogleMaps() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build Google Maps link");
      return;
    }
    points.forEach((p) => {
      const isICAO = /^[A-Z0-9]{3,4}$/.test(p.original);
      if (!isICAO) {
        const googleMapsURL = `https://maps.google.com/?q=${p.lat},${p.lon}&t=k`;
        window.open(googleMapsURL, "_blank");
      }
    });
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to open Google Maps");
  }
}
export function openSkyVector() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build a SkyVector link");
      return;
    }
    const skyVectorRoute = points
      .map((p) => toSkyVectorDMM(p.lat, p.lon))
      .join("+");
    if (!skyVectorRoute) {
      throw new Error("No valid points to create a SkyVector route.");
    }
    const skyVectorURL = `https://skyvector.com/?fpl=${encodeURIComponent(skyVectorRoute)}`;
    window.open(skyVectorURL, "_blank");
  } catch (err) {
    console.error("Failed to open SkyVector:", err);
    alert(err.message || "Unable to open SkyVector");
  }
}
export function toSkyVectorDMM(lat, lon) {
  function convert(value, isLat) {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(2).padStart(5, "0");
    const dir = isLat ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
    const degStr = deg.toString().padStart(isLat ? 2 : 3, "0");
    return `${degStr}${min}${dir}`;
  }
  return `${convert(lat, true)}${convert(lon, false)}`;
}
export function convertDDMMmm(value, isLat) {
  const dir = isLat ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = (abs - deg) * 60;
  const paddedDeg = isLat
    ? deg.toString().padStart(2, "0")
    : deg.toString().padStart(3, "0");
  const minStr = min.toFixed(2).padStart(5, "0");
  return `${paddedDeg}${minStr}${dir}`;
}
export function formatForForeFlight(p) {
  if (p.original.includes(",")) {
    const lat = convertDDMMmm(p.lat, true);
    const lon = convertDDMMmm(p.lon, false);
    return `${lat}/${lon}`;
  }
  return p.original;
}
export function openForeFlight() {
  try {
    const points = getPoints();
    const route = points.map(formatForForeFlight).join("+");
    const url = `foreflightmobile://maps/search?q=${route}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error(err);
  }
}
export function composeEmail() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build email links");
      return;
    }
    const foreflightURLs = [];
    for (let i = 0; i < points.length - 1; i++) {
      const legRoute = [points[i], points[i + 1]]
        .map(formatForForeFlight)
        .join("+");
      const url = `foreflightmobile://maps/search?q=${legRoute}`;
      foreflightURLs.push(url);
    }
    const windyRouteStr = points.map((p) => `${p.lat},${p.lon}`).join(";");
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length;
    const windyURL = `https://www.windy.com/route-planner/vfr/${encodeURIComponent(windyRouteStr)}?layer=radar,${avgLat.toFixed(4)},${avgLon.toFixed(4)},7,p:cities`;
    const fromPoint = points[0];
    const latInt = Math.round(fromPoint.lat * 10000);
    const lonInt = Math.round(fromPoint.lon * 10000);
    const isICAO = /^[A-Z]{4}$/.test(fromPoint.original);
    const hl = isICAO ? fromPoint.original : "";
    const metarURL = `https://metar-taf.com/?c=${latInt}.${lonInt}&hl=${hl}`;
    const skyVectorRoute = points
      .map((p) => toSkyVectorDMM(p.lat, p.lon))
      .join("+");
    const skyVectorURL = `https://skyvector.com/?fpl=${encodeURIComponent(skyVectorRoute)}`;
    const scenePoint = points.find((p) => p.original === "SCENE");
    const googleSceneURL = scenePoint
      ? `https://maps.google.com/?q=${scenePoint.lat},${scenePoint.lon}&t=k`
      : "";
    const flightNumInput =
      document.getElementById("flightNum") ||
      document.getElementById("flight#");
    const flightNum = flightNumInput ? flightNumInput.value.trim() : "";
    const startWp = points[0].original || "";
    const endWp = points[points.length - 1].original || "";
    const subjectStr = `Flight #${flightNum} ${startWp} to ${endWp}`;
    const subject = encodeURIComponent(subjectStr);
    const fullRoute = points.map(formatForForeFlight).join("+");
    const fullForeflightURL = `foreflightmobile://maps/search?q=${fullRoute}`;
    const bodyLines = [
      "Here are the route planner links:\n",
      `ForeFlight (Links for each leg):\n${foreflightURLs.map((url, i) => `Leg ${i + 1}: ${url}`).join("\n")}\n`,
      `\nForeFlight (Entire Route):\n${fullForeflightURL}\n`,
      `\nWindy:\n${windyURL}\n`,
      `\nMETAR-TAF:\n${metarURL}\n`,
      `\nSkyVector:\n${skyVectorURL}`,
    ];
    if (googleSceneURL) {
      bodyLines.push(`\nGoogle Maps (Scene):\n${googleSceneURL}`);
    }
    const body = encodeURIComponent(bodyLines.join(""));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  } catch (err) {
    console.error(err);
  }
}
export function printFlightLog() {
  const date = new Date().toLocaleDateString();
  const reg = document.getElementById("helicopter").value || "";
  const flightNumInput =
    document.getElementById("flightNum") ||
    document.getElementById("flight#");
  const flightNum = flightNumInput ? flightNumInput.value : "";
  const left = document.getElementById("leftPilot").value || "";
  const right = document.getElementById("rightPilot").value || "";
  const seat1a = document.getElementById("seat1a").value || "";
  const seat2a = document.getElementById("seat2a").value || "";
  const seat1c = document.getElementById("seat1c").value || "";
  const legs = [];
  document.querySelectorAll(".leg-row").forEach((leg, i) => {
    if (i < 10) {
      const fromSel = leg.querySelector(".from");
      const toSel = leg.querySelector(".to");
      const fromCode = fromSel.dataset.code || fromSel.value.split(/[\s-]/)[0] || "";
      const toCode = toSel.dataset.code || toSel.value.split(/[\s-]/)[0] || "";
      const fuelUp = parseFloat(leg.querySelector(".legfuel")?.value) || 0;
      let from = fromCode;
      let to = toCode;

      if (fromCode === "SCENE") {
        const lat = leg.querySelector(".from-lat").value;
        const lon = leg.querySelector(".from-lon").value;
        from = lat && lon ? `${lat},${lon}` : "";
      } else if (fromCode) {
        const fName = waypoints[fromCode]?.name;
        if (fName) from = `${fromCode}-${fName}`;
      }

      if (toCode === "SCENE") {
        const lat = leg.querySelector(".to-lat").value;
        const lon = leg.querySelector(".to-lon").value;
        to = lat && lon ? `${lat},${lon}` : "";
      } else if (toCode) {
        const tName = waypoints[toCode]?.name;
        if (tName) to = `${toCode}-${tName}`;
      }

      legs.push({ from, to, fuelUp });
    }
  });
  let legRows = "";
  for (let i = 0; i < 10; i++) {
    const leg = legs[i] || { from: "&nbsp;", to: "&nbsp;", fuelUp: 0 };
    const fuelUpliftVal = leg.fuelUp;
    const litres = fuelUpliftVal ? Math.round(fuelUpliftVal / 0.8) : "";
    const fuelUplift = fuelUpliftVal ? fuelUpliftVal : "&nbsp;";
    const remarks = "";
    legRows += `<tr><td style="text-align: center;" >${i + 1}</td>
      <td>${leg.from}</td>
      <td>${leg.to}</td>
      <td style="text-align: center;" >:</td>
      <td style="text-align: center;" >:</td>
      <td></td>
      <td></td>
      <td></td>
      <td>${remarks}</td>
      </tr>`;
  }
  const weightSection = latestWeightTable
    ? `<div class="weight-section">${latestWeightTable}</div>`
    : "";
  const routeSection = latestRouteTable
    ? `<div class="route-section">${latestRouteTable}</div>`
    : "";
  const twilight = getCivilTwilight();
  const twilightRow = twilight
    ? `<tr>
       <td colspan="2">Civil AM - ${twilight.dawn}</td>
       <td colspan="2">Civil PM - ${twilight.dusk}</td>
       </tr>`
    : "";

  const rootStyles = getComputedStyle(document.documentElement);
  const routeFont = rootStyles.getPropertyValue("--route-table-font-size").trim() || "8px";
  const weightFont = rootStyles.getPropertyValue("--weight-table-font-size").trim() || "10px";
  const infoFont = rootStyles.getPropertyValue("--info-table-font-size").trim() || "8px";
  const legsFont = rootStyles.getPropertyValue("--legs-table-font-size").trim() || "8px";

// fltplan Table 1 //
  const infoTable = `
    <table class="info-table tableizer-table">
      <tbody>
        <tr>
          <th style="font-weight:bold !important;">DATE</th><td style="text-align: center; width: 90px;">${date}</td>
          <th style="font-weight:bold !important;">REG:</th><td>${reg}</td>
          <th style="font-weight:bold !important;">LEFT SEAT:</th><td>${left}</td>
          <th style="font-weight:bold !important;">RIGHT SEAT:</th><td>${right}</td>
          <th style="font-weight:bold !important;">SHIFT:</th><td style="width:40px;"></td>
        </tr>
        <tr>
          <td style="font-weight:bold !important;">FLT#</td><td>${flightNum}</td>
          <td style="font-weight:bold !important;">Seat 1A:</td><td>${seat1a}</td>
          <td style="font-weight:bold !important;">Seat 2A:</td><td>${seat2a}</td>
          <td style="font-weight:bold !important;">Seat 1C:</td><td>${seat1c}</td>
          <td style="font-weight:bold !important;">SQK:</td><td></td>
        </tr>
        ${twilightRow}
      </tbody>
    </table>`;

  // fltplan Table 2 //
  const legsTable = `
    <table class="legs-table tableizer-table">
      <tbody>
        <tr><td>LEG</td>
        <td>ORIGIN</td>
        <td>DESTINATION</td>
        <td style="width:60px;" >START</td>
        <td style="width:60px;" >STOP</td>
        <td style="width:40px;" >AIR</td>
        <td style="width:40px;" >FLT</td>
        <td style="font-size: 8px;">Fuel uplift</td>
        <td style="text-align: center; width: 120px;">REMARKS</td>
        </tr>
        ${legRows}
        <tr><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td>
        </td><td>TOTALS</td><td style="text-align: center;">.</td><td style="text-align: center;">.</td></tr>
      </tbody>
    </table>`;

  const html = `
    <style type="text/css">
    @media print {
      @page {
        size: landscape;
      }
    }
      table.tableizer-table {
      border: 1px solid #CCC;
      font-family: "Roboto", Arial, Helvetica, sans-serif;
      table-layout: auto;
      border-collapse: collapse;
      border-spacing: 0;
      }
      .tableizer-table th,
      .tableizer-table td {
        border: 1px solid #000;
        padding: 4px;
        margin: 0;
        font-weight: normal !important;
      }
    .tableizer-table th {
      background-color: #FFF;
      color:           #000;
    }
    .spacer {
      border: none;
      visibility: hidden;
      padding: 0;
    }
    .print-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .route-section { flex: 2; }
    .weight-section { flex: 1; }
    .route-table { font-size: ${routeFont}; }
    .weight-table {
      font-size: ${weightFont};
      width: auto;
      margin: 0;
    }
    .info-table { font-size: ${infoFont}; }
    .legs-table { font-size: ${legsFont}; }
    .weight-table th,
    .weight-table td {
      padding: 4px;
    }
    .weight-table th:first-child,
    .weight-table td:first-child {
      width: 20px;
    }
    .weight-table th:not(:first-child),
    .weight-table td:not(:first-child) {
      width: 35px;
    }
    </style>
    ${infoTable}
    ${legsTable}
    <div style="margin-top: 12px;">
      ${weightSection}
      ${routeSection}
    </div>`;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.print();
}

