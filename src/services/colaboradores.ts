import api from "./api";
import type { Colaborador } from "../types";

export const colaboradoresService = {
  listar: (params?: Record<string, string>) =>
    api.get<Colaborador[]>("/colaboradores", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Colaborador>(`/colaboradores/${id}`).then((r) => r.data),

  criar: (data: Partial<Colaborador>) =>
    api.post<Colaborador>("/colaboradores", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<Colaborador>) =>
    api.put<Colaborador>(`/colaboradores/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/colaboradores/${id}`),
};
