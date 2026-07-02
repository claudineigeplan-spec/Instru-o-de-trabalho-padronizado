import api from "./api";
import type { HorasEquipamento } from "../types";

export const horasEquipamentoService = {
  listar: (params?: Record<string, string>) =>
    api
      .get<HorasEquipamento[]>("/horas-equipamento", { params })
      .then((r) => r.data),

  buscar: (id: number) =>
    api.get<HorasEquipamento>(`/horas-equipamento/${id}`).then((r) => r.data),

  criar: (data: Partial<HorasEquipamento>) =>
    api.post<HorasEquipamento>("/horas-equipamento", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<HorasEquipamento>) =>
    api
      .put<HorasEquipamento>(`/horas-equipamento/${id}`, data)
      .then((r) => r.data),

  excluir: (id: number) => api.delete(`/horas-equipamento/${id}`),

  enviar: (id: number) =>
    api
      .post<HorasEquipamento>(`/horas-equipamento/${id}/enviar`)
      .then((r) => r.data),

  validar: (id: number) =>
    api
      .post<HorasEquipamento>(`/horas-equipamento/${id}/validar`)
      .then((r) => r.data),
};
