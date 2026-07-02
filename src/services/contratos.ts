import api from "./api";
import type { Contrato, ItemContratual } from "../types";

export const contratosService = {
  listar: (params?: Record<string, string>) =>
    api.get<Contrato[]>("/contratos", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<Contrato>(`/contratos/${id}`).then((r) => r.data),

  criar: (data: Partial<Contrato>) =>
    api.post<Contrato>("/contratos", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<Contrato>) =>
    api.put<Contrato>(`/contratos/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/contratos/${id}`),

  listarItens: (contratoId: number) =>
    api
      .get<ItemContratual[]>(`/contratos/${contratoId}/itens`)
      .then((r) => r.data),

  criarItem: (contratoId: number, data: Partial<ItemContratual>) =>
    api
      .post<ItemContratual>(`/contratos/${contratoId}/itens`, data)
      .then((r) => r.data),

  atualizarItem: (
    contratoId: number,
    itemId: number,
    data: Partial<ItemContratual>,
  ) =>
    api
      .put<ItemContratual>(`/contratos/${contratoId}/itens/${itemId}`, data)
      .then((r) => r.data),

  excluirItem: (contratoId: number, itemId: number) =>
    api.delete(`/contratos/${contratoId}/itens/${itemId}`),
};
