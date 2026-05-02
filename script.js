let highestZ = 100;
let calcBuffer = "";
let activeTimerInterval = null;

// Clock Logic
function startClock() {
    const update = () => {
        document.getElementById("clock").innerText = new Date().toLocaleTimeString([], { 
            hour: '2-digit', minute: '2-digit' 
        });
    };
    setInterval(update, 1000);
    update();
}
startClock();

// Window Engine
function createWindow(title, icon, content) {
    const desktop = document.getElementById("desktop");
    const taskbarItems = document.getElementById("taskbar-items");
    const winId = "win-" + Date.now();

    const win = document.createElement("div");
    win.className = "window";
    win.id = winId;
    
    // Center positioning logic
    win.style.left = `${(window.innerWidth / 2) - 240}px`;
    win.style.top = `${(window.innerHeight / 2) - 175}px`;
    win.style.zIndex = ++highestZ;

    win.innerHTML = `
        <div class="window-header" onmousedown="makeDraggable('${winId}')">
            <span>${icon} ${title}</span>
            <span onclick="closeWindow('${winId}')" style="cursor:pointer; padding:5px;">✕</span>
        </div>
        <div class="window-content">${content}</div>
    `;

    win.onmousedown = () => { win.style.zIndex = ++highestZ; };
    desktop.appendChild(win);

    // Create Taskbar Icon
    const taskIcon = document.createElement("div");
    taskIcon.className = "taskbar-app";
    taskIcon.id = "task-" + winId;
    taskIcon.innerHTML = icon;
    taskIcon.onclick = () => {
        win.style.display = "flex";
        win.style.zIndex = ++highestZ;
    };
    taskbarItems.appendChild(taskIcon);
}

function closeWindow(id) {
    document.getElementById(id).remove();
    document.getElementById("task-" + id).remove();
}

function makeDraggable(id) {
    const el = document.getElementById(id);
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    el.querySelector('.window-header').onmousedown = (e) => {
        x2 = e.clientX; y2 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
            x1 = x2 - e.clientX; y1 = y2 - e.clientY;
            x2 = e.clientX; y2 = e.clientY;
            el.style.top = (el.offsetTop - y1) + "px";
            el.style.left = (el.offsetLeft - x1) + "px";
        };
    };
}

// App Launchers
function toggleStart() { document.getElementById("start-menu").classList.toggle("hidden"); }

function openBrowser() {
    const home = "https://www.wikipedia.org";
    createWindow("Browser", "🌐", `
        <div style="display:flex; flex-direction:column; height:100%;">
            <div style="display:flex; gap:5px; margin-bottom:8px;">
                <input id="bUrl" type="text" value="${home}" style="flex:1;">
                <button onclick="document.getElementById('bFrame').src = document.getElementById('bUrl').value">GO</button>
            </div>
            <iframe id="bFrame" src="${home}" style="flex:1; border:none; border-radius:8px; background:white;"></iframe>
        </div>
    `);
}

function openNotes() {
    createWindow("Notes", "📝", `
        <textarea id="noteArea" oninput="localStorage.setItem('sswd_notes', this.value)" placeholder="Type here..."></textarea>
    `);
    setTimeout(() => {
        const saved = localStorage.getItem('sswd_notes');
        if (saved) document.getElementById('noteArea').value = saved;
    }, 50);
}

/* ================= TIMER WITH BEEP OPTION ================= */
function openTimer() {
    createWindow("Timer", "⏱️", `
        <div style="text-align:center; padding: 10px;">
            <h1 id="tmrDisp" style="font-size:45px; margin:5px 0; font-family:monospace;">00:00</h1>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:10px;">
                <input type="number" id="tmMin" placeholder="Min" style="width:55px; text-align:center;">
                <input type="number" id="tmSec" placeholder="Sec" style="width:55px; text-align:center;">
            </div>
            <button onclick="runTimerLogic()" style="width:100%; border-radius:8px;">START</button>
            <div class="beep-opt">
                <input type="checkbox" id="beepToggle" checked>
                <label for="beepToggle">Enable Beep Sound</label>
            </div>
        </div>
    `);
}

window.runTimerLogic = () => {
    const mins = parseInt(document.getElementById("tmMin").value) || 0;
    const secs = parseInt(document.getElementById("tmSec").value) || 0;
    const shouldBeep = document.getElementById("beepToggle").checked;
    
    let total = (mins * 60) + secs;
    const display = document.getElementById("tmrDisp");

    if (total <= 0) return;

    if (window.activeTimerInterval) clearInterval(window.activeTimerInterval);

    window.activeTimerInterval = setInterval(() => {
        if (total <= 0) {
            clearInterval(window.activeTimerInterval);
            display.innerText = "00:00";
            
            if (shouldBeep) playBeep();
            
            alert("Time is up!");
            return;
        }
        
        total--;
        const m = Math.floor(total / 60);
        const s = total % 60;
        display.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }, 1000);
};

// Pure JS Beep (No files needed)
function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // Frequency in hertz
    oscillator.start();

    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);

    oscillator.stop(audioCtx.currentTime + 1);
}


function openCalculator() {
    const html = `
        <input id="calcD" readonly style="width:100%; text-align:right; font-size:24px; margin-bottom:10px;">
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:5px;">
            ${"789/456*123-0C=+".split("").map(b => `<button onclick="handleCalc('${b}')">${b}</button>`).join("")}
        </div>
    `;
    createWindow("Calculator", "🧮", html);
}

window.handleCalc = (v) => {
    const d = document.getElementById("calcD");
    if(v === "=") { try { calcBuffer = eval(calcBuffer); } catch { calcBuffer = "Error"; } }
    else if(v === "C") calcBuffer = "";
    else calcBuffer += v;
    d.value = calcBuffer;
};

function openFiles() { createWindow("Files", "📁", "<p>Root Directory<br>Documents<br>Downloads</p>"); }
function restartSystem() { location.reload(); }
function openSettings() { alert("Settings - System Version 2.2"); }
