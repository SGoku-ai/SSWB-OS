let highestZ = 100;
let timerInterval = null;

// Init & Clock
window.onload = () => {
    const savedBg = localStorage.getItem('sswd_bg');
    if (savedBg) document.body.style.backgroundImage = `url('${savedBg}')`;
    startClock();
};

function startClock() {
    const update = () => {
        document.getElementById("clock").innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    setInterval(update, 1000);
    update();
}

// Window Logic
function createWindow(title, icon, content) {
    const id = "win-" + Date.now();
    const win = document.createElement("div");
    win.className = "window";
    win.id = id;
    win.style.left = "30%"; win.style.top = "20%";
    win.style.zIndex = ++highestZ;

    win.innerHTML = `
        <div class="window-header" onmousedown="makeDraggable('${id}')">
            <span>${icon} ${title}</span>
            <span onclick="closeWindow('${id}')" style="cursor:pointer">✕</span>
        </div>
        <div class="window-content">${content}</div>
    `;
    win.onmousedown = () => win.style.zIndex = ++highestZ;
    document.getElementById("desktop").appendChild(win);

    const taskItem = document.createElement("div");
    taskItem.className = "taskbar-app";
    taskItem.id = "task-" + id;
    taskItem.innerHTML = icon;
    taskItem.onclick = () => { win.style.display = "flex"; win.style.zIndex = ++highestZ; };
    document.getElementById("taskbar-items").appendChild(taskItem);
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
        document.onmousemove = (e) => {
            x1 = x2 - e.clientX; y1 = y2 - e.clientY;
            x2 = e.clientX; y2 = e.clientY;
            el.style.top = (el.offsetTop - y1) + "px";
            el.style.left = (el.offsetLeft - x1) + "px";
        };
        document.onmouseup = () => { document.onmousemove = null; };
    };
}

// OS Functions
function toggleStart() { document.getElementById("start-menu").classList.toggle("hidden"); }

function openBrowser() {
    createWindow("Browser", "🌐", `
        <div style="display:flex; flex-direction:column; height:100%;">
            <div style="display:flex; gap:5px; margin-bottom:10px;">
                <input id="bUrl" type="text" value="https://www.wikipedia.org" style="flex:1;">
                <button onclick="document.getElementById('bFrame').src = document.getElementById('bUrl').value">Go</button>
            </div>
            <iframe id="bFrame" src="https://www.wikipedia.org" style="flex:1; border:none; background:white;"></iframe>
        </div>
    `);
}

function openNotes() {
    createWindow("Notes", "📝", `<textarea id="ntArea" oninput="localStorage.setItem('sswd_notes', this.value)"></textarea>`);
    setTimeout(() => { document.getElementById("ntArea").value = localStorage.getItem('sswd_notes') || ""; }, 50);
}

function openTimer() {
    createWindow("Timer", "⏱️", `
        <div style="text-align:center">
            <h1 id="tmDisp" style="font-size:40px; margin:10px 0;">00:00</h1>
            <div style="margin-bottom:10px;">
                <input type="number" id="tmM" placeholder="Min" style="width:50px;">
                <input type="number" id="tmS" placeholder="Sec" style="width:50px;">
                <button onclick="startTimer()">Start</button>
            </div>
            <label style="font-size:12px;"><input type="checkbox" id="tmBeep" checked> Enable Beep</label>
        </div>
    `);
}

window.startTimer = () => {
    let total = (parseInt(document.getElementById("tmM").value)||0)*60 + (parseInt(document.getElementById("tmS").value)||0);
    const beep = document.getElementById("tmBeep").checked;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(total <= 0) {
            clearInterval(timerInterval);
            if(beep) { const a=new AudioContext(); const o=a.createOscillator(); o.connect(a.destination); o.start(); o.stop(a.currentTime+0.5); }
            alert("Timer Finished!"); return;
        }
        total--;
        document.getElementById("tmDisp").innerText = `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
    }, 1000);
};

function openSettings() {
    createWindow("Settings", "⚙️", `
        <p>Change Wallpaper</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200" class="wallpaper-preview" onclick="setBG(this.src)">
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200" class="wallpaper-preview" onclick="setBG(this.src)">
        </div>
        <p>Custom URL:</p>
        <input type="text" id="custBG" style="width:65%"><button onclick="setBG(document.getElementById('custBG').value)">Set</button>
    `);
}

window.setBG = (url) => { document.body.style.backgroundImage = `url('${url}')`; localStorage.setItem('sswd_bg', url); };
function openCalculator() { alert("Calculator Ready"); }
function restartSystem() { location.reload(); }
