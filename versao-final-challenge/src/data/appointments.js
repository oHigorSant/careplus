export const STORAGE_KEY = "careplus_consultas_v1";

export const getConsultas = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const salvarConsulta = (data, hora, doctorName, specialty, unit) => {
  const consultas = getConsultas();
  consultas.push({
    data,
    hora,
    doctorName,
    specialty,
    unit,
    type: "user",
    id: Date.now(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consultas));
  return true;
};
