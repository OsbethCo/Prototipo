import API from "./api.js";

export const login = async (usuario, password) => {

  const res = await API.post("/auth/login", {
    usuario,
    password
  });

  return res.data;

};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await API.post("/auth/logout", { refreshToken });
    } catch (error) {
      console.error('Error en logout del servidor:', error);
    }
  }
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('usuario');
};