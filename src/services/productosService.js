import API from "./api.js";

export const obtenerProductos = async () => {
  const res = await API.get("/productos");
  return res.data;
};

export const crearProducto = async (producto) => {
  const res = await API.post("/productos", producto);
  return res.data;
};

export const actualizarStock = async (id, cantidad) => {
  const res = await API.put(`/productos/stock/${id}`, { cantidad });
  return res.data;
};

export const eliminarProducto = async (id) => {
  const res = await API.delete(`/productos/${id}`);
  return res.data;
};
