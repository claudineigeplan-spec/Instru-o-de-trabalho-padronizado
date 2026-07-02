import api from "./api";
import type { EquipeCampo } from "../types";

export const equipesService = {
  listar: (params?: Record<string, string>) =>
    api.get<EquipeCampo[]>("/equipes", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<EquipeCampo>(`/equipes/${id}`).then((r) => r.data),

  criar: (data: Partial<EquipeCampo>) =>
    api.post<EquipeCampo>("/equipes", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<EquipeCampo>) =>
    api.put<EquipeCampo>(`/equipes/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/equipes/${id}`),

  adicionarMembro: (
    equipeId: number,
    data: { colaborador_id: number; funcao_equipe?: string },
  ) =>
    api
      .post<EquipeCampo>(`/equipes/${equipeId}/membros`, data)
      .then((r) => r.data),

  removerMembro: (equipeId: number, colaboradorId: number) =>
    api.delete(`/equipes/${equipeId}/membros/${colaboradorId}`),
};
