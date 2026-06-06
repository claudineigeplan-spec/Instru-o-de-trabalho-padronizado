import api from "./api";
import type { Alerta, Paginated } from "../types";

export const alertasService = {
  listar: (params?: Record<string, string>) =>
    api
      .get<{
        alertas: Paginated<Alerta>;
        nao_lidos: number;
      }>("/alertas", { params })
      .then((r) => r.data),

  marcarLido: (id: number) =>
    api.put<Alerta>(`/alertas/${id}/lido`).then((r) => r.data),

  marcarTodosLidos: () =>
    api.put("/alertas/marcar-todos-lidos").then((r) => r.data),
};
