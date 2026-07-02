import api from "./api";
import type { CentroCusto } from "../types";

export const centrosCustoService = {
  listar: (params?: Record<string, string>) =>
    api.get<CentroCusto[]>("/centros-custo", { params }).then((r) => r.data),

  buscar: (id: number) =>
    api.get<CentroCusto>(`/centros-custo/${id}`).then((r) => r.data),

  criar: (data: Partial<CentroCusto>) =>
    api.post<CentroCusto>("/centros-custo", data).then((r) => r.data),

  atualizar: (id: number, data: Partial<CentroCusto>) =>
    api.put<CentroCusto>(`/centros-custo/${id}`, data).then((r) => r.data),

  excluir: (id: number) => api.delete(`/centros-custo/${id}`),
};
