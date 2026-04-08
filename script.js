// --- CONFIGURACIÓN DE DATOS ---
const SCHEDULE_DATA = {
    Mon: [
        { time: "08:00 - 10:00", show: "Neon Awakening", host: "DJ Cyber" },
        { time: "18:00 - 20:00", show: "Retro Night", host: "DJ Luna" }
    ],
    Tue: [
        { time: "09:00 - 11:00", show: "Digital Dreams", host: "DJ Vector" },
        { time: "21:00 - 23:00", show: "Midnight Pulse", host: "DJ Zero" }
    ],
    Wed: [{ time: "15:00 - 17:00", show: "Synth Wavehouse", host: "DJ Chrome" }],
    Thu: [{ time: "19:00 - 21:00", show: "Grid Runners", host: "DJ Spark" }],
    Fri: [{ time: "22:00 - 02:00", show: "Weekend Overdrive", host: "Guest Artists" }],
    Sat: [
        { time: "14:00 - 18:00", show: "Solar Flare Sessions", host: "DJ Helios" },
        { time: "20:00 - 01:00", show: "Neon Saturday Live", host: "DJ Pulse & Friends" }
    ],
    Sun: [
        { time: "10:00 - 14:00", show: "Sunday Chillwave", host: "DJ Mist" },
        { time: "18:00 - 22:00", show: "Retro Sunset", host: "DJ Vinyl" }
    ]
};

// ==========================================
// RADIO PULSO - LÓGICA DE CONTROL TOTAL
// ==========================================

// 1. SELECCIÓN DE ELEMENTOS (IDs exactos del HTML)
// Estas variables son "atajos" a tus elementos del HTML
const mainAudio = document.getElementById('mainAudio'); // El reproductor invisible
const playBtn = document.getElementById('playBtn');     // Botón Play
const pauseBtn = document.getElementById('pauseBtn');   // Botón Pause
const volSlider = document.getElementById('volumeSlider');
const volIcon = document.getElementById('volIcon');
const waveform = document.getElementById('waveform');   // Las barritas animadas
const statusText = document.getElementById('playerStatus'); // EL CAMBIO CLAVE
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const scheduleGrid = document.getElementById('scheduleGrid');
const defaultStreamUrl = mainAudio?.querySelector('source')?.src || mainAudio?.getAttribute('src') || '';

//  PEGA ESTA VERSIÓN:
function playRadio() {
    if (!mainAudio) return;

    // Si el stream quedó sin src por algún reset, lo restauramos.
    if (!mainAudio.src && defaultStreamUrl) {
        mainAudio.src = defaultStreamUrl;
        mainAudio.load();
    }

    // AUMENTO: Sincroniza el volumen con el slider antes de sonar
    mainAudio.volume = volSlider.value / 100;

    mainAudio.play().then(() => {
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        waveform.classList.add('playing');
        
        // Usamos el ID correcto que arreglamos en el HTML
        const statusDisplay = document.getElementById('playerStatus');
        if (statusDisplay) {
            statusDisplay.innerText = "EN VIVO: NIGHTRIDE FM";
            statusDisplay.style.color = "var(--neon-cyan)";
        }
    }).catch(err => {
        console.error("Error al conectar:", err);
        const statusDisplay = document.getElementById('playerStatus');
        if (statusDisplay) {
            statusDisplay.innerText = "ERROR: PULSA PLAY OTRA VEZ";
            statusDisplay.style.color = "var(--neon-pink)";
        }
    });
}

// 3. FUNCIÓN PARA PAUSAR

function pauseRadio() {
    if (!mainAudio) return;

    // 1. Detenemos el sonido
    mainAudio.pause();
    
    // 2. Reseteamos la conexión del stream de forma estable para reconectar al "en vivo".
    const streamUrl = mainAudio.currentSrc || defaultStreamUrl;
    if (streamUrl) {
        mainAudio.src = streamUrl;
        mainAudio.load();
    }

    // 3. Actualización de Interfaz
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    waveform.classList.remove('playing'); // Las barras de neón se detienen
    
    const statusDisplay = document.getElementById('playerStatus');
    if (statusDisplay) {
        statusDisplay.innerText = "RADIO EN PAUSA";
        statusDisplay.style.color = "var(--text-dim)";
    }
}

// 4. FUNCIÓN DE VOLUMEN (Íconos y Nivel)
function handleVolume() {
    const value = volSlider.value;
    const volumeLevel = value / 100;
    
    mainAudio.volume = volumeLevel;

    // Lógica de iconos dinámicos
    if (value == 0) {
        volIcon.className = 'fas fa-volume-mute';
        volIcon.style.color = 'var(--neon-pink)';
    } else if (value < 50) {
        volIcon.className = 'fas fa-volume-down';
        volIcon.style.color = 'var(--neon-cyan)';
    } else {
        volIcon.className = 'fas fa-volume-up';
        volIcon.style.color = 'var(--neon-cyan)';
    }
}

// 5. ASIGNACIÓN DE EVENTOS
if (playBtn) playBtn.addEventListener('click', playRadio);
if (pauseBtn) pauseBtn.addEventListener('click', pauseRadio);
if (volSlider) volSlider.addEventListener('input', handleVolume);

// 6. INICIALIZACIÓN (Asegurar volumen inicial)
document.addEventListener('DOMContentLoaded', () => {
    if (volSlider && mainAudio) {
        mainAudio.volume = volSlider.value / 100;
    }
});

// --- MENÚ MÓVIL ---
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
    });
}

// Cerrar menú al hacer click en un link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// --- SISTEMA DE HORARIOS ---
function renderSchedule(day) {
  if (!scheduleGrid) return;
  const items = SCHEDULE_DATA[day] || [];
  scheduleGrid.textContent = '';

  for (const item of items) {
    const card = document.createElement('div');
    card.className = 'schedule-item';
    card.innerHTML = `
      <div class="schedule-info">
        <div class="schedule-time"><i class="far fa-clock"></i> </div>
        <div class="schedule-details"><h4></h4><p></p></div>
      </div>
      <button class="reminder-btn"><i class="far fa-bell"></i></button>
    `;
    card.querySelector('.schedule-time').append(document.createTextNode(item.time));
    card.querySelector('h4').textContent = item.show;
    card.querySelector('p').textContent = `Con ${item.host}`;
    scheduleGrid.appendChild(card);
  }
}

function setScheduleWeekendMode(day) {
    const grid = document.getElementById('scheduleGrid');
    if (!grid) return;
    grid.classList.toggle('schedule-grid--weekend', day === 'Sat' || day === 'Sun');
}

// Eventos para los botones de día
document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.day-btn.active')?.classList.remove('active');
        btn.classList.add('active');
        renderSchedule(btn.dataset.day);
        setScheduleWeekendMode(btn.dataset.day);
    });
});

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    renderSchedule('Mon');
    setScheduleWeekendMode('Mon');
    document.getElementById('currentShowTitle').innerText = "Neon Awakening - DJ Cyber";
});

//Forma

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // TODO: validate + send data (fetch/XHR)
    alert('Mensaje enviado correctamente');
    contactForm.reset();
  });
}