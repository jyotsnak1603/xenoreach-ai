import api from "./api";

export const setToken = (access, refresh) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const setUserData = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user));
  }
};

export const getUserData = () => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("user_data");
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const logout = async () => {
  try {
    const refresh = getRefreshToken();
    if (refresh) {
      await api.post("/auth/logout/", { refresh });
    }
  } catch (err) {
    console.error(err);
  } finally {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
};
