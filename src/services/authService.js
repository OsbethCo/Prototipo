import API from "./api";

export const login = async (usuario, password) => {

  const res = await API.post("/auth/login", {
    usuario,
    password
  });

  return res.data;

};