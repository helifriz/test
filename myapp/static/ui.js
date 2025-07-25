import { MEDICS, PILOTS, waypoints } from "./data.js";
export let currentWaypointCodes = [];

export function setupMedicSearch(id) {
  const input = document.getElementById(id);
  const results = document.getElementById(id + "-results");
  if (!input || !results) return;

  function hide() {
    results.style.display = "none";
  }

  function show() {
    const term = input.value.toLowerCase();
    results.innerHTML = "";
    const matches = MEDICS.filter((m) =>
      m.name.toLowerCase().includes(term),
    );
    matches.forEach((m) => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.textContent = m.name;
      div.addEventListener("mousedown", () => {
        input.value = m.name;
        input.focus();
        if (input.value) input.select();
        hide();
        disableDuplicateMedic({ target: input });
        saveCrewSelection();
      });
      results.appendChild(div);
    });
    results.style.display = matches.length ? "block" : "none";
  }

  input.addEventListener("input", show);
  input.addEventListener("focus", () => {
    if (input.value) input.select();
    show();
  });
  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== input) hide();
  });
}
export function disableDuplicateMedic(e) {
  const ids = ["seat1a", "seat2a", "seat1c"];
  const allowMulti = ["Std Male", "Std Female"];
  if (!e || !e.target) return;
  const currentId = e.target.id;
  const currentVal = e.target.value;
  if (!currentVal || allowMulti.includes(currentVal)) return;
  ids.forEach((id) => {
    if (id !== currentId) {
      const other = document.getElementById(id).value;
      if (other === currentVal) {
        alert("Medic already assigned to another seat");
        e.target.value = "";
      }
    }
  });
}
export function disableDuplicatePilot(e) {
  const leftInput = document.getElementById("leftPilot");
  const rightInput = document.getElementById("rightPilot");
  if (leftInput.value && rightInput.value && leftInput.value === rightInput.value) {
    alert("Left and right pilots cannot be the same");
    if (e && e.target === leftInput) {
      leftInput.value = "";
    } else if (e && e.target === rightInput) {
      rightInput.value = "";
    }
  }
}

export function setupPilotSearch(id) {
  const input = document.getElementById(id);
  const results = document.getElementById(id + "-results");
  if (!input || !results) return;

  function hide() {
    results.style.display = "none";
  }

  function show() {
    const term = input.value.toLowerCase();
    results.innerHTML = "";
    const matches = PILOTS.filter((p) =>
      p.name.toLowerCase().includes(term),
    );
    matches.forEach((p) => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.textContent = p.name;
      div.addEventListener("mousedown", () => {
        input.value = p.name;
        input.focus();
        if (input.value) input.select();
        hide();
        disableDuplicatePilot({ target: input });
        saveCrewSelection();
      });
      results.appendChild(div);
    });
    results.style.display = matches.length ? "block" : "none";
  }

  input.addEventListener("input", show);
  input.addEventListener("focus", () => {
    if (input.value) input.select();
    show();
  });
  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== input) hide();
  });
}

export function setupWaypointInput(input) {
  const updateCode = () => {
    const code = input.value.trim();
    if (code === "SCENE") {
      input.dataset.code = "SCENE";
      return;
    }
    if (waypoints[code]) {
      input.dataset.code = code;
      input.value = `${code}-${waypoints[code].name}`;
    } else {
      input.dataset.code = "";
    }
    toggleSceneInputs(input);
  };
  input.addEventListener("change", updateCode);
  input.addEventListener("input", () => toggleSceneInputs(input));
  input.addEventListener("focus", () => {
    if (input.value) input.select();
  });
}

export function setupWaypointSearch(input) {
  const container = input.closest(".waypoint-search");
  const results = container.querySelector(".waypoint-results");
  if (!results) return;

  function hide() {
    results.style.display = "none";
  }

  function show() {
    const term = input.value.toLowerCase();
    results.innerHTML = "";
    const region = document.getElementById("region-select").value;
    const matches = [
      "SCENE",
      ...currentWaypointCodes.filter((code) => {
        const wp = waypoints[code];
        if (region !== "ALL" && !wp.regions.includes(region)) return false;
        return (
          code.toLowerCase().includes(term) ||
          wp.name.toLowerCase().includes(term)
        );
      }),
    ];
    matches.forEach((code) => {
      const div = document.createElement("div");
      div.className = "result-item";
        div.textContent =
          code === "SCENE" ? "Scene" : `${code}-${waypoints[code].name}`;
      div.addEventListener("mousedown", () => {
        input.dataset.code = code;
        input.value =
          code === "SCENE" ? "SCENE" : `${code}-${waypoints[code].name}`;
        hide();
        toggleSceneInputs(input);
        input.focus();
        input.select();
      });
      results.appendChild(div);
    });
    results.style.display = matches.length ? "block" : "none";
  }

  input.addEventListener("input", show);
  input.addEventListener("focus", show);
  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== input) hide();
  });
}

export function setupWaypointInputs() {
  document.querySelectorAll(".from, .to").forEach((input) => {
    setupWaypointInput(input);
    setupWaypointSearch(input);
  });
}

export function populateDropdown(region) {
  currentWaypointCodes = Object.keys(waypoints)
    .filter(
      (code) => region === "ALL" || waypoints[code].regions.includes(region),
    )
    .sort((a, b) => waypoints[a].name.localeCompare(waypoints[b].name));
}
export function populateAllDropdowns() {
  const region = document.getElementById("region-select").value;
  populateDropdown(region);
  document.querySelectorAll(".from, .to").forEach((input) => {
    const code = input.dataset.code;
    if (
      code &&
      code !== "SCENE" &&
      (waypoints[code] === undefined ||
        (region !== "ALL" && !waypoints[code].regions.includes(region)))
    ) {
      input.value = "";
      input.dataset.code = "";
    }
  });
}
export function toggleSceneInputs(select) {
  const code = select.dataset.code || select.value.split(/[\s-]/)[0];
  const parent = select.closest(".leg-row");
  const scene = parent.querySelector("." + select.className + "-scene");
  scene.style.display = code === "SCENE" ? "block" : "none";
}

export function clearLegInputs(row) {
  row.querySelectorAll('.from, .to').forEach((input) => {
    input.value = '';
    input.dataset.code = '';
  });
  row.querySelectorAll('.from-lat, .from-lon, .to-lat, .to-lon').forEach((el) => {
    el.value = '';
  });
  row.querySelectorAll('.from-scene, .to-scene').forEach((el) => {
    el.style.display = 'none';
  });
  row.querySelectorAll('.patient-checkbox, .escort-checkbox').forEach((cb) => {
    cb.checked = false;
  });
  const fuelInput = row.querySelector('.legfuel');
  if (fuelInput) fuelInput.value = '';
}

export function attachRemoveHandler(row) {
  const btn = row.querySelector(".remove-leg-btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    const rows = document.querySelectorAll(".leg-row");
    if (rows[0] === row) {
      clearLegInputs(row);
    } else {
      row.remove();
      document.querySelectorAll(".leg-row").forEach((r, idx) => {
        r.querySelector("label").textContent = `Leg ${idx + 1}:`;
      });
    }
  });
}
export function addLeg() {
  const legRows = document.querySelectorAll(".leg-row");
  const legCount = legRows.length + 1;
  const prevLeg = legRows[legRows.length - 1];
  if (!prevLeg) return;
  const fromSel = prevLeg.querySelector(".from");
    const toSel = prevLeg.querySelector(".to");
    const fromCode = fromSel.dataset.code || fromSel.value.split(/[\s-]/)[0];
    const toCode = toSel.dataset.code || toSel.value.split(/[\s-]/)[0];
    const checkScene = (code, prefix) => {
      if (code !== "SCENE") return true;
      const lat = prevLeg.querySelector(`.${prefix}-lat`).value;
      const lon = prevLeg.querySelector(`.${prefix}-lon`).value;
      return lat && lon;
    };
    if (
      !fromCode ||
      !toCode ||
      !checkScene(fromCode, "from") ||
      !checkScene(toCode, "to")
    ) {
      alert("Please complete the previous leg before adding another.");
      return;
    }
  const prevTo = prevLeg.querySelector(".to");
  const prevToLat = prevLeg.querySelector(".to-lat")?.value;
  const prevToLon = prevLeg.querySelector(".to-lon")?.value;
  const newRow = document.createElement("div");
  newRow.className = "leg-row";
  newRow.innerHTML = `
    <table class="leg-table">
      <tr>
        <td>
          <label>Leg ${legCount}:</label>
          <div class="waypoint-search">
            <input class="from" placeholder="Select Waypoint">
            <div class="waypoint-results"></div>
          </div>
          <div class="scene-inputs from-scene">
            Lat: <input type="number" placeholder="49.1939" step="0.0001" class="from-lat">
            Lon: <input type="number" placeholder="-123.1833" step="0.0001" class="from-lon">
          </div>
          ➝
          <div class="waypoint-search">
            <input class="to" placeholder="Select Waypoint">
            <div class="waypoint-results"></div>
          </div>
          <div class="scene-inputs to-scene">
            Lat: <input type="number" placeholder="49.1939" step="0.0001" class="to-lat">
            Lon: <input type="number" placeholder="-123.1833" step="0.0001" class="to-lon">
          </div>
          <button class="remove-leg-btn">Remove</button>
        </td>
      </tr>
      <tr>
        <td class="leg-options">
          <label><input type="checkbox" class="patient-checkbox"> Patient</label>
          <label><input type="checkbox" class="escort-checkbox"> Escort</label>
          <label>Fuel Uplift</label>
          <input type="number" class="legfuel" min="100" max="904" placeholder="(Kg)" style="width: 50px">
        </td>
      </tr>
    </table>
  `;
  // Append the new row
  document.getElementById("legs").appendChild(newRow);
  const from = newRow.querySelector(".from");
  const to = newRow.querySelector(".to");
  setupWaypointInput(from);
  setupWaypointInput(to);
  setupWaypointSearch(from);
  setupWaypointSearch(to);
  const region = document.getElementById("region-select").value;
  populateDropdown(region);
  // Auto-fill previous TO → next FROM
  if ((prevTo.dataset.code || prevTo.value) === "SCENE") {
    from.dataset.code = "SCENE";
    from.value = "SCENE";
    toggleSceneInputs(from);
    newRow.querySelector(".from-lat").value = prevToLat;
    newRow.querySelector(".from-lon").value = prevToLon;
  } else {
    const code = prevTo.dataset.code || prevTo.value;
    from.dataset.code = code;
    from.value = `${code}-${waypoints[code].name}`;
  }
  attachRemoveHandler(newRow);
}

