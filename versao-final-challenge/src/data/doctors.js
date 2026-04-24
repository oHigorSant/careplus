export const DOCTORS = [
  {
    id: 1,
    name: "Dr. Lucas Silva",
    specialty: "Clínica Médica",
    unit: "1",
    days: [1, 3, 5],
    icon: "bi-person-badge",
  },
  {
    id: 2,
    name: "Dra. Ana Costa",
    specialty: "Clínica Médica",
    unit: "2",
    days: [2, 4],
    icon: "bi-person-badge-fill",
  },
  {
    id: 3,
    name: "Dr. Pedro Santos",
    specialty: "Ortopedista",
    unit: "1",
    days: [1, 2],
    icon: "bi-person-arms-up",
  },
  {
    id: 4,
    name: "Dra. Juliana Lima",
    specialty: "Ortopedista",
    unit: "2",
    days: [3, 4],
    icon: "bi-person-bounding-box",
  },
  {
    id: 5,
    name: "Dr. Marcos Oliveira",
    specialty: "Dermatologista",
    unit: "1",
    days: [5],
    icon: "bi-person-circle",
  },
  {
    id: 6,
    name: "Dra. Fernanda Rocha",
    specialty: "Dermatologista",
    unit: "2",
    days: [1, 2, 3, 4],
    icon: "bi-person-square",
  },
  {
    id: 7,
    name: "Dr. Roberto Souza",
    specialty: "Cardiologista",
    unit: "1",
    days: [2, 3],
    icon: "bi-heart-pulse",
  },
  {
    id: 8,
    name: "Dra. Beatriz Mendes",
    specialty: "Cardiologista",
    unit: "2",
    days: [4, 5],
    icon: "bi-heart-pulse-fill",
  },
];

export const getDoctorsByFilter = (specialty, unit) => {
  return DOCTORS.filter(
    (doc) =>
      (specialty === "Todas" || doc.specialty === specialty) &&
      (unit === "Todas" || doc.unit === unit),
  );
};
