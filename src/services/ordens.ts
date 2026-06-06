import api from "./api";
import type { OrdemServico, Paginated, StatusOS } from "../types";

export const ordensService = {
  listar: (params?: Record<string, string>) =>
    api
      .get<Paginated<OrdemServico>>("/ordens-servico", { params })
      .then((r) => r.data),

  buscar: (id: number) =>
    api.get<OrdemServico>(`/ordens-servico/${id}`).then((r) => r.data),

  criar: (data: Partial<OrdemServico> & { instrucao_trabalho_id?: number }) =>
    api.post<OrdemServico>("/ordens-servico", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<OrdemServico>) =>
    api.put<OrdemServico>(`/ordens-servico/${id}`, data).then((r) => r.data),

  atualizarStatus: (
    id: number,
    status: StatusOS,
    extra?: Record<string, number>,
  ) =>
    api
      .put(`/ordens-servico/${id}/status`, { status, ...extra })
      .then((r) => r.data),

  concluirPasso: (
    osId: number,
    passoId: number,
    data: { concluido: boolean; observacao?: string },
  ) =>
    api
      .put(`/ordens-servico/${osId}/passos/${passoId}`, data)
      .then((r) => r.data),

  excluir: (id: number) => api.delete(`/ordens-servico/${id}`),
};
