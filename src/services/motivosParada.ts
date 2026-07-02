import api from "./api";
import type { MotivoParada } from "../types";

export const motivosParadaService = {
  listar: () => api.get<MotivoParada[]>("/motivos-parada").then((r) => r.data),
};
