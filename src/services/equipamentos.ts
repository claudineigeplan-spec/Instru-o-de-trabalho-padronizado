import api from "./api";
import type { Equipamento } from "../types";

export const equipamentosService = {
  listar: (params?: Record<string, string>) =>
    api.get<Equipamento[]>("/equipamentos", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Equipamento>(`/equipamentos/${id}`).then((r) => r.data),

  criar: (data: Partial<Equipamento>) =>
    api.post<Equipamento>("/equipamentos", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<Equipamento>) =>
    api.put<Equipamento>(`/equipamentos/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/equipamentos/${id}`),

  registrarUso: (
    id: number,
    data: { km_atual?: number; horas_atual?: number; data: string },
  ) => api.post(`/equipamentos/${id}/uso`, data).then((r) => r.data),

  historico: (id: number) =>
    api.get(`/equipamentos/${id}/historico`).then((r) => r.data),
};
