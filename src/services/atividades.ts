import api from "./api";
import type { Atividade } from "../types";

export const atividadesService = {
  listar: (params?: Record<string, string>) =>
    api.get<Atividade[]>("/atividades", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Atividade>(`/atividades/${id}`).then((r) => r.data),

  criar: (data: Partial<Atividade>) =>
    api.post<Atividade>("/atividades", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<Atividade>) =>
    api.put<Atividade>(`/atividades/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/atividades/${id}`),
};
