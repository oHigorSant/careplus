export function renderCalendar(
  containerId,
  viewDate,
  today,
  consultas,
  onDayClick,
  selectedDateStr,
  selectedDoctor,
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  container.setAttribute("role", "grid");
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Preenchimento de dias do mês anterior para alinhar a grade
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("calendar-day");
    emptyDiv.style.opacity = "0";
    container.appendChild(emptyDiv);
  }

  // Dias do mês atual
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayEl = document.createElement("div");
    dayEl.classList.add("calendar-day", "current-month");
    dayEl.innerText = day;
    dayEl.setAttribute("role", "gridcell");

    let ariaLabel = `${day} de ${viewDate.toLocaleString("pt-BR", { month: "long" })} de ${year}`;
    const hasApp = consultas.some((c) => c.data === dateStr);
    if (hasApp) ariaLabel += " - Possui consulta agendada";

    // Regra de Negócio: Bloquear datas passadas ou iguais a hoje
    const isPast = date <= today;

    if (isPast) {
      dayEl.style.opacity = "0.3";
      dayEl.style.cursor = "not-allowed";
      ariaLabel += " - Data indisponível";
    } else {
      dayEl.setAttribute("tabindex", "0");
      if (dateStr === selectedDateStr) ariaLabel += " - Selecionado";
    }

    if (dateStr === selectedDateStr && !isPast)
      dayEl.classList.add("active-day");

    if (selectedDoctor && selectedDoctor.days.includes(date.getDay())) {
      dayEl.classList.add("has-event");
    }

    if (hasApp) dayEl.classList.add("has-user-event");

    if (!isPast) {
      dayEl.addEventListener("click", () => onDayClick(dateStr));
      dayEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDayClick(dateStr);
        }
      });
    }

    dayEl.setAttribute("aria-label", ariaLabel);
    // Destaque para finais de semana
    if (date.getDay() === 0 || date.getDay() === 6)
      dayEl.classList.add("weekend");

    container.appendChild(dayEl);
  }
}
