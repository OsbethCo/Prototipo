import API from "./api";

export const obtenerProductos = async () => {

  const res = await API.get("/productos");

  return res.data;

};