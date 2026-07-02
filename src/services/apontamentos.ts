import api from "./api";
import type { ApontamentoProducao } from "../types";

export const apontamentosService = {
  listar: (params?: Record<string, string>) =>
    api
      .get<ApontamentoProducao[]>("/apontamentos", { params })
      .then((r) => r.data),

  buscar: (id: number) =>
    api.get<ApontamentoProducao>(`/apontamentos/${id}`).then((r) => r.data),

  criar: (data: Partial<ApontamentoProducao>) =>
    api.post<ApontamentoProducao>("/apontamentos", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<ApontamentoProducao>) =>
    api
      .put<ApontamentoProducao>(`/apontamentos/${id}`, data)
      .then((r) => r.data),

  excluir: (id: number) => api.delete(`/apontamentos/${id}`),

  enviar: (id: number) =>
    api
      .post<ApontamentoProducao>(`/apontamentos/${id}/enviar`)
      .then((r) => r.data),

  validar: (id: number) =>
    api
      .post<ApontamentoProducao>(`/apontamentos/${id}/validar`)
      .then((r) => r.data),

  rejeitar: (id: number, motivo_rejeicao: string) =>
    api
      .post<ApontamentoProducao>(`/apontamentos/${id}/rejeitar`, {
        motivo_rejeicao,
      })
      .then((r) => r.data),
};
