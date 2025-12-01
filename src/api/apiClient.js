import axios from "axios";
import { getToken, removeToken } from "../utils/auth";

const apiClient1 = axios.create({
  baseURL: "http://192.168.1.27:8080/api",
  timeout: 15000
});

const apiClient2 = axios.create({
  baseURL: "http://192.168.1.44:8082/api",
  timeout: 15000
});

const setupInterceptors = (client) => {
  client.interceptors.request.use(config => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }, error => Promise.reject(error));

  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 && getToken()) {
        removeToken();
        window.location.replace("/login");
      }
      return Promise.reject(error);
    }
  );
};

setupInterceptors(apiClient1);
setupInterceptors(apiClient2);

export { apiClient1, apiClient2 };
