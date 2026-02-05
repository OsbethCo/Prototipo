import API from "./api.js";

export const crearRetiro = async (data) => {
  const res = await API.post("/retiros", data);
  return res.data;
};

export const obtenerRetiros = async () => {
  const res = await API.get("/retiros");
  return res.data;
};

export const obtenerHistorial = async () => {
  const res = await API.get("/retiros");
  return res.data;
};

// Funciones para GestionPacientes
export const obtenerRegistrosPacientes = async () => {
  const res = await API.get("/retiros/registros-pacientes");
  return res.data;
};

export const obtenerTodosRegistros = async () => {
  const res = await API.get("/retiros/registros-todos");
  return res.data;
};

export const obtenerInventarioPaciente = async () => {
  const res = await API.get("/retiros/inventario-paciente");
  return res.data;
};

export const obtenerProductosRetiro = async () => {
  const res = await API.get("/retiros/productos");
  return res.data;
};
