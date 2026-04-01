// ================================
// NOLTRAX MATCH (NO VIDEO VERSION)
// Video dimainkan di tab terpisah
// ================================

let isDrawing = false;
let startX, startY;

// ================================
// DATA STORE (NYAWA NOLTRAX)
// ================================

let eventTimeline = []; // 🔥 DATA EVENT MENTAH

let pitchData = {
  pitch1: { arrows: [], players: [] },
  pitch2: { arrows: [], players: [] }
};

let strategyNotes = {
  compete: "",
  competeNotes: "",
  control: "",
  controlNotes: "",
  concepts: "",
  conceptsNotes: "",
  individualTargets: "",
  individualTargetsNotes: ""
};

// ================================
// MANUAL TIMER (REPLACEMENT FOR VIDEO TIME)
// ================================

let matchTimer = {
  running: false,
  startTime: null,
  elapsed: 0,
  interval: null
};

// Create manual timer display
function createTimerDisplay() {
  const actionPanel = document.getElementById("actionPanel");
  
  const timerContainer = document.createElement("div");
  timerContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(0,0,0,0.3);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
  `;
  
  const timerDisplay = document.createElement("div");
  timerDisplay.id = "manualTimer";
  timerDisplay.style.cssText = `
    font-size: 32px;
    font-weight: 800;
    font-family: 'Courier New', monospace;
    color: #1e5eff;
  `;
  timerDisplay.textContent = "00:00";
  
  const controlButtons = document.createElement("div");
  controlButtons.style.cssText = "display: flex; gap: 8px;";
  
  const startBtn = document.createElement("button");
  startBtn.textContent = "▶ Start";
  startBtn.id = "startTimerBtn";
  startBtn.style.cssText = `
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: #1e5eff;
    color: white;
    font-weight: bold;
    cursor: pointer;
  `;
  
  const pauseBtn = document.createElement("button");
  pauseBtn.textContent = "⏸ Pause";
  pauseBtn.id = "pauseTimerBtn";
  pauseBtn.style.cssText = `
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: #666;
    color: white;
    font-weight: bold;
    cursor: pointer;
  `;
  
  const resetBtn = document.createElement("button");
  resetBtn.textContent = "⟲ Reset";
  resetBtn.id = "resetTimerBtn";
  resetBtn.style.cssText = `
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: #ff4444;
    color: white;
    font-weight: bold;
    cursor: pointer;
  `;
  
  controlButtons.appendChild(startBtn);
  controlButtons.appendChild(pauseBtn);
  controlButtons.appendChild(resetBtn);
  
  timerContainer.appendChild(timerDisplay);
  timerContainer.appendChild(controlButtons);
  
  actionPanel.insertBefore(timerContainer, actionPanel.firstChild);
  
  // Event listeners
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
}

function startTimer() {
  if (matchTimer.running) return;
  
  matchTimer.running = true;
  matchTimer.startTime = Date.now() - matchTimer.elapsed;
  
  matchTimer.interval = setInterval(() => {
    matchTimer.elapsed = Date.now() - matchTimer.startTime;
    updateTimerDisplay();
  }, 100);
}

function pauseTimer() {
  if (!matchTimer.running) return;
  
  matchTimer.running = false;
  clearInterval(matchTimer.interval);
}

function resetTimer() {
  pauseTimer();
  matchTimer.elapsed = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const totalSeconds = Math.floor(matchTimer.elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const display = document.getElementById("manualTimer");
  if (display) {
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function getCurrentTime() {
  return Math.floor(matchTimer.elapsed / 1000);
}

// ================================
// EVENT LOGGING (UI + DATA)
// ================================

function tagEvent(tagName) {
  const currentTime = getCurrentTime();
  const minute = Math.floor(currentTime / 60);
  const second = currentTime % 60;

  // 🔥 SIMPAN DATA MENTAH (dengan placeholder note)
  const eventIndex = eventTimeline.length;
  eventTimeline.push({
    minute,
    second,
    actionType: tagName,
    note: "" // akan diupdate dari input
  });

  // UI LOG (PUNYA LU)
  const logList = document.getElementById("log");
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="log-header">
      <strong contenteditable="true">${tagName}</strong>
      <span>${formatTime(currentTime)}</span>
    </div>
    <input class="log-note" data-event-index="${eventIndex}" placeholder="Add note...">
  `;
  logList.insertBefore(li, logList.firstChild);

  // 🔥 TRACK NOTE CHANGES
  const noteInput = li.querySelector(".log-note");
  noteInput.addEventListener("input", (e) => {
    const idx = parseInt(e.target.getAttribute("data-event-index"));
    eventTimeline[idx].note = e.target.value;
  });
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ================================
// DRAG & DROP PLAYER (FIXED)
// ================================

function allowDrop(ev) { ev.preventDefault(); }

function drag(ev) {
  const noInput = ev.target.querySelector(".player-no");
  ev.dataTransfer.setData("text", noInput ? noInput.value : "?");
}

function drop(ev) {
  ev.preventDefault();
  const val = ev.dataTransfer.getData("text");
  const rect = ev.currentTarget.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * 100;
  const y = ((ev.clientY - rect.top) / rect.height) * 100;
  createPlayerToken(ev.currentTarget.id, val, x, y);
}

function createPlayerToken(pitchId, number, x, y) {
  const container = document.querySelector(`#${pitchId} .player-layer`);
  const token = document.createElement("div");
  token.className = "player-token";
  token.innerText = number;
  token.style.left = x + "%";
  token.style.top = y + "%";
  
  // 🔥 SIMPAN POSISI PLAYER KE DATA
  pitchData[pitchId].players.push({
    number: number,
    x: x,
    y: y
  });

  token.oncontextmenu = e => {
    e.preventDefault();
    // 🔥 HAPUS DARI DATA JUGA
    const playerIndex = pitchData[pitchId].players.findIndex(
      p => p.number === number && Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1
    );
    if (playerIndex > -1) {
      pitchData[pitchId].players.splice(playerIndex, 1);
    }
    token.remove();
  };
  
  container.appendChild(token);
}

// ================================
// DRAWING ARROWS
// ================================

document.querySelectorAll(".pitch-canvas").forEach(canvas => {
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redrawCanvas(canvas.parentElement.id);
  };

  window.addEventListener("resize", resize);
  setTimeout(resize, 200);

  canvas.addEventListener("mousedown", e => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
  });

  canvas.addEventListener("mousemove", e => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    redrawCanvas(canvas.parentElement.id);
    drawArrow(ctx, startX, startY, e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener("mouseup", e => {
    if (!isDrawing) return;
    isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    pitchData[canvas.parentElement.id].arrows.push({
      startX,
      startY,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top
    });
  });
});

function drawArrow(ctx, fromX, fromY, toX, toY) {
  const headlen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.strokeStyle = "#1e90ff";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function redrawCanvas(pitchId) {
  const canvas = document.querySelector(`#${pitchId} .pitch-canvas`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pitchData[pitchId].arrows.forEach(a =>
    drawArrow(ctx, a.startX, a.startY, a.endX, a.endY)
  );
}

// ================================
// TRACK STRATEGY NOTES
// ================================

function trackStrategyNotes() {
  const textareas = document.querySelectorAll(".note-item textarea");
  const keys = [
    "compete", "competeNotes",
    "control", "controlNotes", 
    "concepts", "conceptsNotes",
    "individualTargets", "individualTargetsNotes"
  ];
  
  textareas.forEach((textarea, index) => {
    textarea.addEventListener("input", (e) => {
      strategyNotes[keys[index]] = e.target.value;
    });
  });
}

// ================================
// SAVE SESSION (DOWNLOAD JSON)
// ================================

function saveSession() {
  const metadata = {
    matchName: document.getElementById("matchName").value,
    matchDate: document.getElementById("matchDate").value,
    homeTeam: document.getElementById("homeTeam").value,
    awayTeam: document.getElementById("awayTeam").value,
    analyst: document.getElementById("analyst").value,
    analyzedTeam: document.getElementById("analyzedTeam").value
  };

  // 🔥 AMBIL SQUAD DATA
  const squadRows = document.querySelectorAll("#squadBody tr:not(.sub-row)");
  const squad = {
    starters: [],
    substitutes: []
  };

  let isSubSection = false;
  squadRows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    if (inputs.length === 3) {
      const playerData = {
        number: inputs[0].value,
        position: inputs[1].value,
        name: inputs[2].value
      };
      
      if (!isSubSection && playerData.number) {
        squad.starters.push(playerData);
      } else if (isSubSection && playerData.number) {
        squad.substitutes.push(playerData);
      }
    }
    
    // Cek apakah row selanjutnya adalah sub section
    if (row.nextElementSibling && row.nextElementSibling.classList.contains("sub-row")) {
      isSubSection = true;
    }
  });

  const session = {
    meta: metadata,
    squad: squad,
    timeline: eventTimeline,     // 🔥 EVENT LOG dengan notes
    pitchData: pitchData,        // 🔥 MATCHDAY PLANNER dengan player positions
    strategyNotes: strategyNotes, // 🔥 COMPETE, CONTROL, CONCEPTS notes
    actionButtons: actionButtons,
    matchDuration: formatTime(getCurrentTime()), // Total match time
    source: "noltrax-match-novideo",
    savedAt: new Date().toISOString()
  };

  // 🔥 DOWNLOAD JSON FILE
  const jsonStr = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  
  // Filename: matchName_date.json atau fallback
  const fileName = metadata.matchName 
    ? `${metadata.matchName.replace(/\s/g, "_")}_${metadata.matchDate || "match"}.json`
    : `noltrax_match_${new Date().getTime()}.json`;
  
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert("✅ Session saved! JSON file downloaded.");
}

// ================================
// EDIT ACTION BUTTONS
// ================================

const editActionsBtn = document.createElement("button");
editActionsBtn.innerText = "Edit Actions";
editActionsBtn.style.cssText = `
  position: absolute;
  top: 5px;
  right: 18px;
  z-index: 50;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: #1e5eff;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;
document.querySelector("#actionPanel").appendChild(editActionsBtn);

let actionButtons = [
  "Build-up",
  "Pressing",
  "CO-Press",
  "Counter",
  "Progressive",
  "Mid-OVR",
  "Back-OVR",
  "Transition"
];

const savedActions = JSON.parse(localStorage.getItem("actionButtons"));
if (savedActions) actionButtons = savedActions;

function updateActionButtons() {
  const btns = document.getElementById("tags").querySelectorAll("button");
  btns.forEach((btn, idx) => {
    btn.innerText = actionButtons[idx] || btn.innerText;
    btn.onclick = () => tagEvent(actionButtons[idx] || btn.innerText);
  });
}
updateActionButtons();

editActionsBtn.onclick = () => {
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    background: rgba(30,30,30,0.95);
    padding: 20px;
    border-radius: 16px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  content.innerHTML = `<h3 style="color:white;">Edit Action Buttons</h3>`;

  const inputs = [];
  actionButtons.forEach(name => {
    const input = document.createElement("input");
    input.value = name;
    input.style.padding = "8px";
    input.style.borderRadius = "8px";
    content.appendChild(input);
    inputs.push(input);
  });

  const saveBtn = document.createElement("button");
  saveBtn.innerText = "Save";
  saveBtn.style.cssText = `
    padding: 10px;
    border-radius: 12px;
    background: #1e5eff;
    color: white;
    font-weight: bold;
  `;

  saveBtn.onclick = () => {
    inputs.forEach((inp, i) => actionButtons[i] = inp.value);
    updateActionButtons();
    localStorage.setItem("actionButtons", JSON.stringify(actionButtons));
    modal.remove();
  };

  content.appendChild(saveBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);
};

// ================================
// INITIALIZATION
// ================================

window.addEventListener("DOMContentLoaded", () => {
  trackStrategyNotes();
  createTimerDisplay();
  console.log("🟢 Noltrax Match (No Video) initialized");
  console.log("📺 Play video in separate tab");
  console.log("⏱️ Use manual timer to track match time");
});
