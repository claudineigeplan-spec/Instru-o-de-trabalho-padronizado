import api from "./api";
import type { Rodovia, Trecho } from "../types";

export const rodoviasService = {
  listar: (params?: Record<string, string>) =>
    api.get<Rodovia[]>("/rodovias", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Rodovia>(`/rodovias/${id}`).then((r) => r.data),

  criar: (data: Partial<Rodovia>) =>
    api.post<Rodovia>("/rodovias", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<Rodovia>) =>
    api.put<Rodovia>(`/rodovias/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/rodovias/${id}`),

  listarTrechos: (rodoviaId: number) =>
    api.get<Trecho[]>(`/rodovias/${rodoviaId}/trechos`).then((r) => r.data),

  criarTrecho: (rodoviaId: number, data: Partial<Trecho>) =>
    api
      .post<Trecho>(`/rodovias/${rodoviaId}/trechos`, data)
      .then((r) => r.data),

  atualizarTrecho: (
    rodoviaId: number,
    trechoId: number,
    data: Partial<Trecho>,
  ) =>
    api
      .put<Trecho>(`/rodovias/${rodoviaId}/trechos/${trechoId}`, data)
      .then((r) => r.data),

  excluirTrecho: (rodoviaId: number, trechoId: number) =>
    api.delete(`/rodovias/${rodoviaId}/trechos/${trechoId}`),
};
