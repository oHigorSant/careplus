import { renderCalendar } from "../components/calendar.js";
import {
  getConsultas,
  salvarConsulta,
  STORAGE_KEY,
} from "../data/appointments.js";
import { getDoctorsByFilter } from "../data/doctors.js";

const state = {
  today: new Date(2026, 3, 5),
  currentViewDate: new Date(2026, 3, 1),
  selectedDate: null,
  maxDate: new Date(2026, 6, 1),
  filteredDoctors: [],
  selectedDoctor: null,
  reschedulingId: null,
};

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function init() {
  setupSidebar();
  const isConsultasPage = window.location.pathname.includes("consultas.html");
  const isInicioPage =
    window.location.pathname.includes("inicio.html") ||
    window.location.pathname.endsWith("/");

  if (isConsultasPage) {
    setupCalendarNavigation();
    setupSearch();
    updateUI();
    renderAppointmentsList();
    checkRescheduleParam();
  } else if (isInicioPage) {
    renderDashboardAppointments();
    updateDashboardCalendar();
    setupDashboardActions();
    checkUserLevel();
  }
}

function setupSidebar() {
  const [sidebar, toggle, close] = [
    "sidebar",
    "sidebarToggle",
    "sidebarClose",
  ].map((id) => document.getElementById(id));

  if (toggle)
    toggle.addEventListener("click", () => sidebar.classList.add("active"));
  if (close)
    close.addEventListener("click", () => sidebar.classList.remove("active"));
}

function checkRescheduleParam() {
  const data = sessionStorage.getItem("remarcar_appointment");
  if (!data) return;

  const appointment = JSON.parse(data);
  const specialtySelect = document.getElementById("searchSpecialty");
  const unitSelect = document.getElementById("searchUnit");

  if (specialtySelect && unitSelect) {
    state.reschedulingId = appointment.id;
    specialtySelect.value = appointment.specialty;
    unitSelect.value = appointment.unit;

    state.filteredDoctors = getDoctorsByFilter(
      appointment.specialty,
      appointment.unit,
    );
    renderDoctors();

    setTimeout(() => {
      const container = document.getElementById("doctorsContainer");
      if (container) container.scrollIntoView({ behavior: "smooth" });
      alert(
        `Remarcando: Selecione um novo horário para ${appointment.specialty} com ${appointment.doctorName}.`,
      );
    }, 500);
  }
}

function openAppointmentModal(action) {
  const consultas = getConsultas();
  if (consultas.length === 0)
    return alert("Você não possui consultas agendadas.");

  const container = document.getElementById("listaConsultasModal");
  if (!container) return;

  container.innerHTML = consultas
    .map((c) => {
      const [y, m, d] = c.data.split("-");
      return `
      <div class="appointment-list-item d-flex align-items-center justify-content-between p-3 bg-light rounded shadow-sm">
        <div class="lh-sm">
          <div class="fw-bold" style="color: var(--care-corporate)">${c.specialty}</div>
          <small class="text-muted">${c.doctorName} • ${d}/${m}</small>
        </div>
        <button class="btn btn-primary btn-sm rounded-pill px-3" 
                aria-label="${action === "remarcar" ? "Remarcar" : action === "cancelar" ? "Cancelar" : "Alterar para teleconsulta"} consulta de ${c.specialty} com ${c.doctorName}"
                onclick="window.handleAppointmentAction(${c.id}, '${action}')">
          ${action === "remarcar" ? "Selecionar" : action === "cancelar" ? "Cancelar" : "Alterar"}
        </button>
      </div>
    `;
    })
    .join("");

  const modal = new bootstrap.Modal(
    document.getElementById("modalSelecaoConsulta"),
  );
  modal.show();
}

window.handleAppointmentAction = (id, action) => {
  const consultas = getConsultas();
  const app = consultas.find((c) => c.id === id);

  if (action === "remarcar") {
    sessionStorage.setItem("remarcar_appointment", JSON.stringify(app));
    window.location.href = "consultas.html";
  } else if (action === "cancelar") {
    if (confirm("Confirmar cancelamento deste agendamento?")) {
      const novas = consultas.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
      location.reload();
    }
  } else if (action === "teleconsulta") {
    alert(
      "Modalidade alterada! O link da teleconsulta foi enviado para seu e-mail.",
    );
    location.reload();
  }
};

function setupDashboardActions() {
  const btnRemarcar = document.getElementById("btnRemarcar");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnTeleconsulta = document.getElementById("btnTeleconsulta");

  if (btnRemarcar)
    btnRemarcar.addEventListener("click", () =>
      openAppointmentModal("remarcar"),
    );
  if (btnCancelar)
    btnCancelar.addEventListener("click", () =>
      openAppointmentModal("cancelar"),
    );
  if (btnTeleconsulta)
    btnTeleconsulta.addEventListener("click", () =>
      openAppointmentModal("teleconsulta"),
    );
}

function checkUserLevel() {
  const level = localStorage.getItem('userLevel');
  if (level === 'diamante') {
    const userLevelHeader = document.getElementById('userLevelHeader');
    if (userLevelHeader) userLevelHeader.innerText = 'Cliente Diamond';

    const inicioBadgeIcon = document.getElementById('inicioBadgeIcon');
    if (inicioBadgeIcon) {
      inicioBadgeIcon.innerHTML = `
        <div class="diamond-badge-complex" style="width: 50px;">
          <div class="diamond-badge-container" style="transform: scale(0.7); transform-origin: center;">
            <div class="diamond-rosette"></div>
            <div class="diamond-inner">
              <svg width="24" height="18" viewBox="0 0 20 15" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 7 7 12 18 2" />
              </svg>
            </div>
            <div class="diamond-ribbon"></div>
          </div>
        </div>
      `;
      inicioBadgeIcon.className = '';
      inicioBadgeIcon.style.cssText = '';
    }

    const userPointsText = document.getElementById('userPointsText');
    if (userPointsText) {
      let pts = parseInt(userPointsText.innerText) || 3179;
      userPointsText.innerText = (pts + 1834).toString();
    }

    const userLevelProgressBar = document.getElementById('userLevelProgressBar');
    if (userLevelProgressBar) {
      userLevelProgressBar.style.width = '100%';
      userLevelProgressBar.setAttribute('aria-valuenow', '100');
    }

    const userLevelText = document.getElementById('userLevelText');
    if (userLevelText) {
      userLevelText.innerText = 'Diamante';
      userLevelText.style.color = '#66C5F0';
    }
  }
}

function setupSearch() {
  const btn = document.getElementById("searchBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const spec = document.getElementById("searchSpecialty").value;
    const unit = document.getElementById("searchUnit").value;

    state.filteredDoctors = getDoctorsByFilter(spec, unit);
    state.selectedDoctor = null;
    state.selectedDate = null;

    renderDoctors();
    updateUI();
    document
      .getElementById("doctorsContainer")
      .scrollIntoView({ behavior: "smooth" });
  });
}

function setupCalendarNavigation() {
  document.getElementById("prevMonth").addEventListener("click", () => {
    if (state.currentViewDate > state.today) {
      state.currentViewDate.setMonth(state.currentViewDate.getMonth() - 1);
      updateUI();
    }
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    if (state.currentViewDate < state.maxDate) {
      state.currentViewDate.setMonth(state.currentViewDate.getMonth() + 1);
      updateUI();
    }
  });
}

function updateUI() {
  const label = document.getElementById("currentMonthLabel");
  if (label) {
    const month = MONTH_NAMES[state.currentViewDate.getMonth()];
    label.innerText = `${month} ${state.currentViewDate.getFullYear()}`;
  }

  renderCalendar(
    "calendarGrid",
    state.currentViewDate,
    state.today,
    getConsultas(),
    handleDateSelection,
    state.selectedDate,
    state.selectedDoctor,
  );
}

function renderDoctors() {
  const container = document.getElementById("doctorsContainer");
  if (!container) return;

  container.setAttribute("aria-live", "polite");
  container.innerHTML =
    '<h4 class="month-column-title w-100 mb-4">Especialistas Disponíveis</h4>';

  state.filteredDoctors.forEach((doc) => {
    const card = document.createElement("div");
    card.className = "col-md-3 mb-3";
    const isSelected = state.selectedDoctor?.id === doc.id;
    const borderStyle = isSelected
      ? "2px solid var(--care-primary)"
      : "1px solid transparent";

    card.innerHTML = `
      <div class="care-card text-center p-3 h-100" 
           role="button" 
           tabindex="0" 
           aria-label="Médico ${doc.name}, especialista em ${doc.specialty}, Unidade ${doc.unit}" 
           style="cursor:pointer; border: ${borderStyle}">
        <i class="bi ${doc.icon}" style="font-size: 2rem; color: var(--care-primary)" aria-hidden="true"></i>
        <h6 class="mt-2 mb-1 fw-bold">${doc.name}</h6>
        <small class="text-muted d-block">${doc.specialty}</small>
        <small class="badge bg-light text-dark mt-2">Unidade ${doc.unit}</small>
      </div>`;

    card.addEventListener("click", () => {
      state.selectedDoctor = doc;
      renderDoctors();
      updateUI();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
    container.appendChild(card);
  });
}

function handleDateSelection(dateStr) {
  if (!state.selectedDoctor) return alert("Selecione um médico primeiro.");

  state.selectedDate = dateStr;
  const [y, m, d] = dateStr.split("-");
  document.getElementById("selectedDayLabel").innerText =
    `Horários para o dia ${d}/${m}/${y} com ${state.selectedDoctor.name}`;
  renderTimeSlots();
  updateUI();
}

function renderTimeSlots() {
  const container = document.getElementById("timeSlotsContainer");
  if (!container) return;
  container.setAttribute("aria-live", "polite");
  const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
  const consultas = getConsultas();

  container.innerHTML = hours
    .map((h) => {
      // Verifica se já existe uma consulta para este médico, nesta data e neste horário
      const isOccupied = consultas.some(
        (c) =>
          c.data === state.selectedDate &&
          c.hora === h &&
          c.doctorName === state.selectedDoctor.name,
      );

      if (isOccupied) {
        return `<button class="time-slot" disabled aria-label="Horário das ${h} indisponível">${h}</button>`;
      }

      return `<button class="time-slot available" aria-label="Agendar horário das ${h}" onclick="window.bookTime('${h}')">${h}</button>`;
    })
    .join("");
}

function renderDashboardAppointments() {
  const container = document.getElementById("dashboardAppointments");
  if (!container) return;

  const consultas = getConsultas();
  if (!consultas.length) {
    container.innerHTML = `<p class="text-muted text-center py-3">Nenhum agendamento encontrado.</p>`;
    return;
  }

  const sorted = consultas
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 3);
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  container.innerHTML = sorted
    .map((c) => {
      const [y, m, d] = c.data.split("-");
      return `
      <div class="appointment-list-item">
        <div class="appointment-icon border bg-white">
          <i class="bi bi-calendar2-check text-dark" style="font-size: 1.3rem"></i>
        </div>
        <div class="appointment-details">
          <p class="appointment-title fw-bold" style="font-size: 1rem">${c.specialty}</p>
          <p class="appointment-sub">${c.doctorName} • Unidade ${c.unit}</p>
        </div>
        <div class="appointment-date text-end">
          <span class="date-main text-muted">${d} ${meses[parseInt(m) - 1]} ${y}</span>
          <span class="d-block fw-bold text-primary" style="font-size: 0.85rem">${c.hora}</span>
        </div>
      </div>`;
    })
    .join("");
}

function updateDashboardCalendar() {
  renderCalendar(
    "miniCalendarGrid",
    state.today,
    state.today,
    getConsultas(),
    (date) => (window.location.href = `consultas.html?date=${date}`),
    null,
    null,
  );
}

function renderAppointmentsList() {
  const container = document.getElementById("appointmentListContainer");
  if (!container) return;

  const consultas = getConsultas();
  if (!consultas.length) {
    container.innerHTML =
      "<p class='text-muted p-3'>Nenhuma consulta agendada.</p>";
    return;
  }

  container.innerHTML = consultas
    .map((c) => {
      const [y, m, d] = c.data.split("-");
      return `
            <div class="appointment-list-item">
                <div class="appointment-icon"><i class="bi bi-calendar-check text-primary"></i></div>
                <div class="appointment-details">
                    <p class="appointment-title">${c.specialty}</p>
                    <p class="appointment-sub">${c.doctorName} • Unidade ${c.unit}</p>
                </div>
                <div class="appointment-date text-end">
                    <span class="date-main">${d}/${m}/${y}</span>
                    <span class="fw-bold text-primary">${c.hora}</span>
                </div>
            </div>
        `;
    })
    .join("");
}

// Expondo para o escopo global para facilitar o clique nos slots gerados via string
window.bookTime = (time) => {
  if (!state.selectedDate || !state.selectedDoctor)
    return alert("Selecione um médico e uma data primeiro.");

  const [y, m, d] = state.selectedDate.split("-");
  const msg = `Confirmar agendamento:\n\nMédico: ${state.selectedDoctor.name}\nEspecialidade: ${state.selectedDoctor.specialty}\nData: ${d}/${m}/${y}\nHora: ${time}`;

  if (confirm(msg)) {
    // Se for uma remarcação, remove a consulta antiga antes de salvar a nova
    if (state.reschedulingId) {
      const consultas = getConsultas();
      const novasConsultas = consultas.filter(
        (c) => c.id !== state.reschedulingId,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novasConsultas));
      state.reschedulingId = null;
      sessionStorage.removeItem("remarcar_appointment");
    }

    salvarConsulta(
      state.selectedDate,
      time,
      state.selectedDoctor.name,
      state.selectedDoctor.specialty,
      state.selectedDoctor.unit,
    );
    alert("Consulta agendada com sucesso!");
    state.selectedDate = null;
    updateUI();
    renderAppointmentsList();
    // Limpa slots após agendar
    document.getElementById("timeSlotsContainer").innerHTML = "";
    document.getElementById("selectedDayLabel").innerText =
      "Selecione uma data no calendário";
  }
};

init();
