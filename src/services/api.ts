import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export function resolveErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors) {
      return Object.values(data.errors as Record<string, string[]>)
        .flat()
        .join(" ");
    }
    if (error.response?.status === 403) return "Acesso não autorizado.";
    if (error.response?.status === 404) return "Recurso não encontrado.";
    if (error.response?.status === 500) return "Erro interno do servidor.";
  }
  return "Ocorreu um erro inesperado.";
}

export default api;
