import api from "./api";
import type { Programacao, ProgramacaoItem } from "../types";

export const programacoesService = {
  listar: (params?: Record<string, string>) =>
    api.get<Programacao[]>("/programacoes", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Programacao>(`/programacoes/${id}`).then((r) => r.data),

  criar: (
    data: Partial<Programacao> & { itens?: Partial<ProgramacaoItem>[] },
  ) => api.post<Programacao>("/programacoes", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<Programacao>) =>
    api.put<Programacao>(`/programacoes/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/programacoes/${id}`),

  criarItem: (programacaoId: number, data: Partial<ProgramacaoItem>) =>
    api
      .post<ProgramacaoItem>(`/programacoes/${programacaoId}/itens`, data)
      .then((r) => r.data),

  atualizarItem: (
    programacaoId: number,
    itemId: number,
    data: Partial<ProgramacaoItem>,
  ) =>
    api
      .put<ProgramacaoItem>(
        `/programacoes/${programacaoId}/itens/${itemId}`,
        data,
      )
      .then((r) => r.data),

  excluirItem: (programacaoId: number, itemId: number) =>
    api.delete(`/programacoes/${programacaoId}/itens/${itemId}`),
};
