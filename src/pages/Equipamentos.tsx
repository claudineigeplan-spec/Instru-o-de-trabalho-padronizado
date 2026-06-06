import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import GlassModal from "../components/ui/GlassModal";
import StatusBadge from "../components/ui/StatusBadge";
import { equipamentosService } from "../services/equipamentos";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { resolveErrorMessage } from "../services/api";
import { formatTipoEquipamento } from "../utils/format";
import api from "../services/api";
import type { Equipamento, TipoEquipamento, StatusEquipamento } from "../types";

const tipoIcone: Record<TipoEquipamento, string> = {
  veiculo_leve: "🚗",
  caminhao: "🚛",
  maquina_pesada: "🏗️",
  utilitario: "🚐",
  reboque: "🚜",
  veiculo: "🚗",
  maquina: "⚙️",
  eletrico_hidraulico: "⚡",
};

export default function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Equipamento | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [qrEquipamento, setQrEquipamento] = useState<Equipamento | null>(null);
  const [qrSvg, setQrSvg] = useState("");
  const [scanBanner, setScanBanner] = useState<Equipamento | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const podeEditar = user?.role === "gestor" || user?.role === "lider_campo";
  const toast = useToast();

  const [form, setForm] = useState<Partial<Equipamento>>({
    nome: "",
    tipo: "caminhao",
    modelo: "",
    fabricante: "",
    ano: undefined,
    placa_serie: "",
    hodometro_atual: 0,
    horimetro_atual: 0,
  });

  async function carregar() {
    const params: Record<string, string> = {};
    if (filtroTipo) params.tipo = filtroTipo;
    if (filtroStatus) params.status = filtroStatus;
    const data = await equipamentosService.listar(params);
    setEquipamentos(data);
    setLoading(false);

    const scan = searchParams.get("scan");
    if (scan) {
      const found = data.find((e) => e.placa_serie === scan);
      if (found) setScanBanner(found);
      setSearchParams({}, { replace: true });
    }
  }

  useEffect(() => {
    carregar();
  }, [filtroTipo, filtroStatus]);

  function abrirCriacao() {
    setEditando(null);
    setForm({
      nome: "",
      tipo: "caminhao",
      modelo: "",
      fabricante: "",
      ano: undefined,
      placa_serie: "",
      hodometro_atual: 0,
      horimetro_atual: 0,
    });
    setModalAberto(true);
  }

  function abrirEdicao(e: Equipamento) {
    setEditando(e);
    setForm(e);
    setModalAberto(true);
  }

  async function salvar() {
    try {
      if (editando) {
        await equipamentosService.atualizar(editando.id, form);
        toast.success("Equipamento atualizado.");
      } else {
        await equipamentosService.criar(form);
        toast.success("Equipamento cadastrado.");
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir este equipamento?")) return;
    try {
      await equipamentosService.excluir(id);
      toast.success("Equipamento excluído.");
      carregar();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  }

  async function abrirQr(eq: Equipamento) {
    setQrEquipamento(eq);
    setQrSvg("");
    try {
      const res = await api.get(`/equipamentos/${eq.id}/qrcode`, {
        responseType: "text",
      });
      setQrSvg(res.data as string);
    } catch {
      setQrSvg("");
    }
  }

  function imprimirQr() {
    const win = window.open("", "_blank");
    if (!win || !qrEquipamento) return;
    win.document.write(`
      <html><head><title>QR — ${qrEquipamento.nome}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:20px}
      h2{margin-bottom:4px;font-size:14px}p{color:#666;font-size:12px;margin:0 0 12px}</style>
      </head><body>
      <h2>${qrEquipamento.nome}</h2>
      <p>${qrEquipamento.placa_serie ?? ""} · ${formatTipoEquipamento(qrEquipamento.tipo)}</p>
      ${qrSvg}
      </body></html>`);
    win.document.close();
    win.print();
  }

  return (
    <div className="p-6 space-y-4">
      {scanBanner && (
        <div className="bg-blue-500/15 border border-blue-400/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <div className="text-white font-semibold">{scanBanner.nome}</div>
              <div className="text-blue-300 text-xs">
                {scanBanner.placa_serie} ·{" "}
                {formatTipoEquipamento(scanBanner.tipo)} · QR Code identificado
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate("/checklists", {
                  state: { equipamentoId: scanBanner.id },
                })
              }
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Executar Checklist
            </button>
            <button
              onClick={() => setScanBanner(null)}
              className="text-gray-400 hover:text-white text-lg px-2 leading-none"
              title="Dispensar"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Equipamentos</h1>
        {podeEditar && (
          <button
            onClick={abrirCriacao}
            className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Novo Equipamento
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todos os tipos</option>
          <option value="veiculo_leve">Veículo Leve</option>
          <option value="caminhao">Caminhão</option>
          <option value="maquina_pesada">Máquina Pesada</option>
          <option value="utilitario">Utilitário</option>
          <option value="reboque">Reboque</option>
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="em_manutencao">Em Manutenção</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Carregando...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipamentos.map((eq) => (
            <GlassCard key={eq.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tipoIcone[eq.tipo]}</span>
                  <div>
                    <div className="text-white font-medium">{eq.nome}</div>
                    <div className="text-gray-400 text-xs">
                      {formatTipoEquipamento(eq.tipo)}
                    </div>
                  </div>
                </div>
                <StatusBadge status={eq.status} />
              </div>

              {(eq.modelo || eq.fabricante) && (
                <div className="text-gray-400 text-xs mb-2">
                  {eq.fabricante} {eq.modelo} {eq.ano && `(${eq.ano})`}
                </div>
              )}
              {eq.placa_serie && (
                <div className="text-gray-500 text-xs mb-3">
                  Placa/Série: {eq.placa_serie}
                </div>
              )}

              <div className="flex gap-4 text-xs text-gray-400 border-t border-white/10 pt-3">
                {eq.hodometro_atual > 0 && (
                  <div>
                    <span className="text-white">
                      {eq.hodometro_atual.toLocaleString("pt-BR")}
                    </span>{" "}
                    km
                  </div>
                )}
                {eq.horimetro_atual > 0 && (
                  <div>
                    <span className="text-white">
                      {eq.horimetro_atual.toLocaleString("pt-BR")}
                    </span>{" "}
                    h
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => abrirQr(eq)}
                  className="flex-1 text-xs text-gray-400 hover:text-white py-1 transition-colors"
                  title="QR Code"
                >
                  QR
                </button>
                {podeEditar && (
                  <>
                    <button
                      onClick={() => abrirEdicao(eq)}
                      className="flex-1 text-xs text-gray-400 hover:text-white py-1 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluir(eq.id)}
                      className="flex-1 text-xs text-red-400 hover:text-red-300 py-1 transition-colors"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal QR Code */}
      <GlassModal
        open={!!qrEquipamento}
        onClose={() => setQrEquipamento(null)}
        title={`QR Code — ${qrEquipamento?.nome ?? ""}`}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {qrSvg ? (
            <div
              className="bg-white p-4 rounded-xl"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <div className="text-gray-400 text-sm py-8">Gerando QR Code...</div>
          )}
          <div className="text-center">
            <div className="text-white font-medium text-sm">
              {qrEquipamento?.nome}
            </div>
            <div className="text-gray-400 text-xs mt-0.5">
              {qrEquipamento?.placa_serie} ·{" "}
              {formatTipoEquipamento(qrEquipamento?.tipo ?? "caminhao")}
            </div>
          </div>
          <p className="text-gray-500 text-xs text-center max-w-xs">
            Escaneie para abrir o equipamento no sistema e registrar checklist
            ou manutenção.
          </p>
          {qrSvg && (
            <button
              onClick={imprimirQr}
              className="bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              🖨️ Imprimir etiqueta
            </button>
          )}
        </div>
      </GlassModal>

      <GlassModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? "Editar Equipamento" : "Novo Equipamento"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Nome *</label>
              <input
                value={form.nome ?? ""}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#f97316]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipo *</label>
              <select
                value={form.tipo ?? "veiculo"}
                onChange={(e) =>
                  setForm({ ...form, tipo: e.target.value as TipoEquipamento })
                }
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="veiculo_leve">Veículo Leve</option>
                <option value="caminhao">Caminhão</option>
                <option value="maquina_pesada">Máquina Pesada</option>
                <option value="utilitario">Utilitário</option>
                <option value="reboque">Reboque</option>
              </select>
            </div>
            {editando && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Status
                </label>
                <select
                  value={form.status ?? "ativo"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as StatusEquipamento,
                    })
                  }
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="em_manutencao">Em Manutenção</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Fabricante
              </label>
              <input
                value={form.fabricante ?? ""}
                onChange={(e) =>
                  setForm({ ...form, fabricante: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Modelo</label>
              <input
                value={form.modelo ?? ""}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ano</label>
              <input
                type="number"
                value={form.ano ?? ""}
                onChange={(e) =>
                  setForm({ ...form, ano: Number(e.target.value) })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Placa / Série
              </label>
              <input
                value={form.placa_serie ?? ""}
                onChange={(e) =>
                  setForm({ ...form, placa_serie: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Hodômetro atual (km)
              </label>
              <input
                type="number"
                value={form.hodometro_atual ?? 0}
                onChange={(e) =>
                  setForm({ ...form, hodometro_atual: Number(e.target.value) })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Horímetro atual (h)
              </label>
              <input
                type="number"
                value={form.horimetro_atual ?? 0}
                onChange={(e) =>
                  setForm({ ...form, horimetro_atual: Number(e.target.value) })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalAberto(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="bg-[#f97316] hover:bg-[#f97316]/90 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
