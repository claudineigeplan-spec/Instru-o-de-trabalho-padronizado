<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Equipamento;
use App\Models\PlanoManutencao;
use App\Models\GatilhoPlano;
use App\Models\ModeloChecklist;
use App\Models\ItemChecklist;
use App\Models\ItemEstoque;
use App\Models\InstrucaoTrabalho;
use App\Models\PassoIt;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsuarios();
        $this->seedFrota();
        $this->seedEstoque();
        $this->seedPlanosManutencao();
        $this->seedInstrucoesTrabalho();
        $this->seedChecklists();
    }

    private function seedUsuarios(): void
    {
        $usuarios = [
            // Gestores
            ['name' => 'Marcos Diretor',             'email' => 'diretoria@instrucao.com',    'role' => 'gestor',      'setor' => 'Diretoria'],
            ['name' => 'Carlos Gestor de Manutenção','email' => 'gestor@instrucao.com',        'role' => 'gestor',      'setor' => 'Manutenção'],
            // Líderes / PCP
            ['name' => 'Ricardo Gestor de Produção', 'email' => 'producao@instrucao.com',     'role' => 'lider_campo', 'setor' => 'Produção'],
            ['name' => 'Sandra Gestora de Suprimentos','email' => 'suprimentos@instrucao.com','role' => 'lider_campo', 'setor' => 'Suprimentos'],
            ['name' => 'Fernanda PCP',               'email' => 'pcp@instrucao.com',          'role' => 'lider_campo', 'setor' => 'PCP'],
            ['name' => 'Ana Líder de Campo',         'email' => 'lider@instrucao.com',        'role' => 'lider_campo', 'setor' => 'Operações'],
            // Mecânicos
            ['name' => 'João Mecânico',              'email' => 'mecanico@instrucao.com',     'role' => 'mecanico',    'setor' => 'Manutenção'],
            ['name' => 'Fernando Encarregado',       'email' => 'encarregado@instrucao.com',  'role' => 'mecanico',    'setor' => 'Manutenção'],
            // Operadores / Motoristas
            ['name' => 'Pedro Operador de Máquinas', 'email' => 'operador@instrucao.com',     'role' => 'operador',    'setor' => 'Campo'],
            ['name' => 'Paulo Motorista',            'email' => 'motorista@instrucao.com',    'role' => 'operador',    'setor' => 'Campo'],
            ['name' => 'Waldemiro Operador',         'email' => 'waldemiro@instrucao.com',    'role' => 'operador',    'setor' => 'Campo'],
        ];

        foreach ($usuarios as $u) {
            User::updateOrCreate(['email' => $u['email']], array_merge($u, [
                'password' => Hash::make('123456'),
                'ativo' => true,
            ]));
        }
    }

    private function seedFrota(): void
    {
        $frota = [
            // ── CAMINHÕES PESADOS ──────────────────────────────────────────
            [
                'nome' => 'GPL-0001 — M.BENZ/ATEGO 1418 TOCO CAÇAMBA',
                'tipo' => 'caminhao', 'modelo' => 'ATEGO 1418 TOCO', 'fabricante' => 'Mercedes-Benz',
                'ano' => 2006, 'placa_serie' => 'HMG-6I78', 'horimetro_atual' => 0,
                'hodometro_atual' => 148300, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0002 — VW/24.250 CNC 6X2 CAÇAMBA',
                'tipo' => 'caminhao', 'modelo' => '24.250 CNC 6X2', 'fabricante' => 'Volkswagen',
                'ano' => 2011, 'placa_serie' => 'CNI-1611', 'horimetro_atual' => 0,
                'hodometro_atual' => 112500, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0003 — VW/24.250 CNC 6X2 CAÇAMBA',
                'tipo' => 'caminhao', 'modelo' => '24.250 CNC 6X2', 'fabricante' => 'Volkswagen',
                'ano' => 2010, 'placa_serie' => 'EHH-7D74', 'horimetro_atual' => 0,
                'hodometro_atual' => 124800, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0004 — M.BENZ/ACCELO 915C BAÚ',
                'tipo' => 'caminhao', 'modelo' => 'ACCELO 915C', 'fabricante' => 'Mercedes-Benz',
                'ano' => 2007, 'placa_serie' => 'CVN-4A86', 'horimetro_atual' => 0,
                'hodometro_atual' => 97600, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0005 — FORD/CARGO 1319',
                'tipo' => 'caminhao', 'modelo' => 'CARGO 1319', 'fabricante' => 'Ford',
                'ano' => 2012, 'placa_serie' => 'ERE-4F64', 'horimetro_atual' => 0,
                'hodometro_atual' => 83200, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0006 — FORD/F12000',
                'tipo' => 'caminhao', 'modelo' => 'F12000', 'fabricante' => 'Ford',
                'ano' => 1994, 'placa_serie' => 'CAZ-2J31', 'horimetro_atual' => 0,
                'hodometro_atual' => 342000, 'status' => 'em_manutencao',
            ],
            [
                'nome' => 'GPL-0007 — IVECO/DAILY CAMPO 4013 4X4',
                'tipo' => 'caminhao', 'modelo' => 'DAILY CAMPO 4013 4X4', 'fabricante' => 'Iveco',
                'ano' => 2007, 'placa_serie' => 'DXH-1352', 'horimetro_atual' => 0,
                'hodometro_atual' => 178400, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0008 — DODGE/900 PIPA',
                'tipo' => 'caminhao', 'modelo' => 'DODGE 900', 'fabricante' => 'Dodge',
                'ano' => 1972, 'placa_serie' => 'BXS-6647', 'horimetro_atual' => 0,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0009 — VW/19.320 CLC TT CAVALO MECÂNICO',
                'tipo' => 'caminhao', 'modelo' => '19.320 CLC TT', 'fabricante' => 'Volkswagen',
                'ano' => 2008, 'placa_serie' => 'DPB-7I47', 'horimetro_atual' => 0,
                'hodometro_atual' => 214600, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0010 — REB/TRIVELLATO CARRETA PLATAFORMA',
                'tipo' => 'reboque', 'modelo' => 'CARRETA PLATAFORMA', 'fabricante' => 'Trivellato',
                'ano' => 1969, 'placa_serie' => 'BSG-8241', 'horimetro_atual' => 0,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0012 — FORD/CARGO 1317 + MUNCK',
                'tipo' => 'caminhao', 'modelo' => 'CARGO 1317', 'fabricante' => 'Ford',
                'ano' => 2005, 'placa_serie' => 'DKX-7811', 'horimetro_atual' => 0,
                'hodometro_atual' => 192300, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0025 — VW/10.160 DRC 4X2',
                'tipo' => 'caminhao', 'modelo' => '10.160 DRC 4X2', 'fabricante' => 'Volkswagen',
                'ano' => 2016, 'placa_serie' => 'IXR-7F96', 'horimetro_atual' => 0,
                'hodometro_atual' => 54700, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0036 — CARRETA REBOQUE AZUL',
                'tipo' => 'reboque', 'modelo' => 'CARRETA REBOQUE', 'fabricante' => '—',
                'ano' => 2014, 'placa_serie' => 'OWV8E85', 'horimetro_atual' => 0,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0037 — CARGA REBOQUE',
                'tipo' => 'reboque', 'modelo' => 'CARGA REBOQUE', 'fabricante' => '—',
                'ano' => 2024, 'placa_serie' => 'TLY0E00', 'horimetro_atual' => 0,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0038 — VW/31.320 CNC 6X4 CAÇAMBA',
                'tipo' => 'caminhao', 'modelo' => '31.320 CNC 6X4', 'fabricante' => 'Volkswagen',
                'ano' => 2011, 'placa_serie' => 'KVL-7202', 'horimetro_atual' => 0,
                'hodometro_atual' => 98400, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0039 — VW/24.260 CRM 6X2 CAÇAMBA',
                'tipo' => 'caminhao', 'modelo' => '24.260 CRM 6X2', 'fabricante' => 'Volkswagen',
                'ano' => 2021, 'placa_serie' => 'EIR-9F77', 'horimetro_atual' => 0,
                'hodometro_atual' => 31200, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0041 — CARGA REBOQUE',
                'tipo' => 'reboque', 'modelo' => 'CARGA REBOQUE', 'fabricante' => '—',
                'ano' => null, 'placa_serie' => 'UGP9A39', 'horimetro_atual' => 0,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],

            // ── MÁQUINAS PESADAS ───────────────────────────────────────────
            [
                'nome' => 'GPL-0011 — KOMATSU ESCAVADEIRA PC200-8',
                'tipo' => 'maquina_pesada', 'modelo' => 'PC200-8', 'fabricante' => 'Komatsu',
                'ano' => 2009, 'placa_serie' => 'KMTPC180K51B30461', 'horimetro_atual' => 9240,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0015 — MAXXOR PÁ CARREGADEIRA',
                'tipo' => 'maquina_pesada', 'modelo' => 'PÁ CARREGADEIRA', 'fabricante' => 'Maxxor',
                'ano' => 2013, 'placa_serie' => 'GPL-0015', 'horimetro_atual' => 5480,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0016 — CATERPILLAR PATROL 120B (Motoniveladora)',
                'tipo' => 'maquina_pesada', 'modelo' => '120B', 'fabricante' => 'Caterpillar',
                'ano' => 1979, 'placa_serie' => '64007439', 'horimetro_atual' => 18650,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0017 — HUBERWACO 140S PATROL (Motoniveladora)',
                'tipo' => 'maquina_pesada', 'modelo' => '140S', 'fabricante' => 'Huberwaco',
                'ano' => 1982, 'placa_serie' => '140A2383', 'horimetro_atual' => 22100,
                'hodometro_atual' => 0, 'status' => 'em_manutencao',
            ],
            [
                'nome' => 'GPL-0018 — CASE RETROESCAVADEIRA 580M',
                'tipo' => 'maquina_pesada', 'modelo' => '580M', 'fabricante' => 'Case',
                'ano' => 2010, 'placa_serie' => 'NAAH23022', 'horimetro_atual' => 7320,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0019 — NEW HOLLAND RETROESCAVADEIRA B110B',
                'tipo' => 'maquina_pesada', 'modelo' => 'B110B 4x4', 'fabricante' => 'New Holland',
                'ano' => 2011, 'placa_serie' => 'HBZN110BLBAH02722', 'horimetro_atual' => 6890,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0021 — VOLVO RETROESCAVADEIRA BL60B',
                'tipo' => 'maquina_pesada', 'modelo' => 'BL60B', 'fabricante' => 'Volvo',
                'ano' => null, 'placa_serie' => 'VCE0B60BT02122410', 'horimetro_atual' => 4120,
                'hodometro_atual' => 0, 'status' => 'inativo',
            ],
            [
                'nome' => 'GPL-0022 — TEMA TERRA ROLO CHAPA',
                'tipo' => 'maquina_pesada', 'modelo' => 'ROLO CHAPA MD TH10', 'fabricante' => 'Tema Terra',
                'ano' => null, 'placa_serie' => 'GPL-0022', 'horimetro_atual' => 3840,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0023 — VOLVO ROLO COMPACTADOR SD105',
                'tipo' => 'maquina_pesada', 'modelo' => 'SD105', 'fabricante' => 'Volvo',
                'ano' => 2014, 'placa_serie' => 'VCE0S105AE0707108', 'horimetro_atual' => 2760,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0024 — TEMA TERRA ROLO DE PNEUS SP6000',
                'tipo' => 'maquina_pesada', 'modelo' => 'SP6000', 'fabricante' => 'Tema Terra',
                'ano' => 1973, 'placa_serie' => 'GPL-0024', 'horimetro_atual' => 5120,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0027 — CATERPILLAR ROLINHO COMPACTADOR CB-214C',
                'tipo' => 'maquina_pesada', 'modelo' => 'CB-214C', 'fabricante' => 'Caterpillar',
                'ano' => null, 'placa_serie' => '1051098001567', 'horimetro_atual' => 1980,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0030 — MASSEY FERGUSON TRATOR 42754CETIER',
                'tipo' => 'maquina_pesada', 'modelo' => '42754CETIER', 'fabricante' => 'Massey Ferguson',
                'ano' => null, 'placa_serie' => 'J187361', 'horimetro_atual' => 3650,
                'hodometro_atual' => 0, 'status' => 'ativo',
            ],

            // ── VEÍCULOS LEVES ──────────────────────────────────────────────
            [
                'nome' => 'GPL-0013 — VW/NOVO GOL TL MCV',
                'tipo' => 'veiculo_leve', 'modelo' => 'Novo Gol TL MCV', 'fabricante' => 'Volkswagen',
                'ano' => 2016, 'placa_serie' => 'BAQ-6D60', 'horimetro_atual' => 0,
                'hodometro_atual' => 68400, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0014 — VW/GOL 1.0 GIV',
                'tipo' => 'veiculo_leve', 'modelo' => 'Gol 1.0 GIV', 'fabricante' => 'Volkswagen',
                'ano' => 2012, 'placa_serie' => 'OFV-8J92', 'horimetro_atual' => 0,
                'hodometro_atual' => 94300, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0020 — VW/NOVA SAVEIRO RB MBVS',
                'tipo' => 'veiculo_leve', 'modelo' => 'Nova Saveiro RB MBVS', 'fabricante' => 'Volkswagen',
                'ano' => 2021, 'placa_serie' => 'RCL-6D62', 'horimetro_atual' => 0,
                'hodometro_atual' => 28700, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0026 — VW/KOMBI',
                'tipo' => 'utilitario', 'modelo' => 'Kombi', 'fabricante' => 'Volkswagen',
                'ano' => 2011, 'placa_serie' => 'EYX-8914', 'horimetro_atual' => 0,
                'hodometro_atual' => 112800, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0028 — VW/NOVO VOYAGE 1.6 CITY',
                'tipo' => 'veiculo_leve', 'modelo' => 'Novo Voyage 1.6 City', 'fabricante' => 'Volkswagen',
                'ano' => 2014, 'placa_serie' => 'FNA-1A80', 'horimetro_atual' => 0,
                'hodometro_atual' => 76500, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0031 — VW/UP TAKE MA',
                'tipo' => 'veiculo_leve', 'modelo' => 'Up Take MA', 'fabricante' => 'Volkswagen',
                'ano' => 2016, 'placa_serie' => 'FVA6962', 'horimetro_atual' => 0,
                'hodometro_atual' => 62400, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0032 — VW/GOL CITY MB S',
                'tipo' => 'veiculo_leve', 'modelo' => 'Gol City MB S', 'fabricante' => 'Volkswagen',
                'ano' => 2015, 'placa_serie' => 'FFC6F37', 'horimetro_atual' => 0,
                'hodometro_atual' => 84200, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0033 — VW/GOL CITY MB S',
                'tipo' => 'veiculo_leve', 'modelo' => 'Gol City MB S', 'fabricante' => 'Volkswagen',
                'ano' => 2014, 'placa_serie' => 'FBH5B19', 'horimetro_atual' => 0,
                'hodometro_atual' => 91700, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0034 — VW/FOX 1.0 GII',
                'tipo' => 'veiculo_leve', 'modelo' => 'Fox 1.0 GII', 'fabricante' => 'Volkswagen',
                'ano' => 2013, 'placa_serie' => 'FSV7799', 'horimetro_atual' => 0,
                'hodometro_atual' => 87900, 'status' => 'ativo',
            ],
            [
                'nome' => 'GPL-0035 — VW/UP TAKE MA',
                'tipo' => 'veiculo_leve', 'modelo' => 'Up Take MA', 'fabricante' => 'Volkswagen',
                'ano' => 2016, 'placa_serie' => 'GFA8D49', 'horimetro_atual' => 0,
                'hodometro_atual' => 58300, 'status' => 'ativo',
            ],
        ];

        foreach ($frota as $eq) {
            Equipamento::updateOrCreate(['placa_serie' => $eq['placa_serie']], $eq);
        }
    }

    private function seedEstoque(): void
    {
        $itens = [
            // Peças caminhão
            ['codigo' => 'PC-001', 'nome' => 'Filtro de Óleo Motor (caminhão)',      'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 10],
            ['codigo' => 'PC-002', 'nome' => 'Filtro de Ar Primário',                'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 8],
            ['codigo' => 'PC-003', 'nome' => 'Filtro de Ar Secundário',              'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 6],
            ['codigo' => 'PC-004', 'nome' => 'Filtro de Combustível Diesel',         'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 10],
            ['codigo' => 'PC-005', 'nome' => 'Filtro Separador de Água',             'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 6],
            ['codigo' => 'PC-006', 'nome' => 'Filtro Hidráulico Retroescavadeira',   'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'PC-007', 'nome' => 'Pastilha de Freio Dianteira',          'tipo' => 'peca',   'unidade' => 'jg', 'estoque_minimo' => 4],
            ['codigo' => 'PC-008', 'nome' => 'Lona de Freio Traseira',               'tipo' => 'peca',   'unidade' => 'jg', 'estoque_minimo' => 4],
            ['codigo' => 'PC-009', 'nome' => 'Correia Dentada',                      'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 3],
            ['codigo' => 'PC-010', 'nome' => 'Correia do Alternador',                'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'PC-011', 'nome' => 'Vela de Ignição (veículo leve)',       'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 16],
            ['codigo' => 'PC-012', 'nome' => 'Bateria 150Ah (caminhão)',             'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 2],
            ['codigo' => 'PC-013', 'nome' => 'Bateria 60Ah (veículo leve)',          'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 2],
            ['codigo' => 'PC-014', 'nome' => 'Rolamento de Roda Dianteira',         'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'PC-015', 'nome' => 'Amortecedor Dianteiro',               'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 2],
            ['codigo' => 'PC-016', 'nome' => 'Mangueira de Radiador',               'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 3],
            ['codigo' => 'PC-017', 'nome' => 'Termostato Motor',                    'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 2],
            ['codigo' => 'PC-018', 'nome' => 'Bomba d\'Água',                       'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 1],
            // Óleos
            ['codigo' => 'OL-001', 'nome' => 'Óleo Motor 15W40 (Diesel) — tambor',  'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 50],
            ['codigo' => 'OL-002', 'nome' => 'Óleo Motor 5W30 (Flex) — balde 5L',  'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 20],
            ['codigo' => 'OL-003', 'nome' => 'Óleo de Câmbio Manual 85W140',        'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 20],
            ['codigo' => 'OL-004', 'nome' => 'Óleo Hidráulico HV68',               'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 40],
            ['codigo' => 'OL-005', 'nome' => 'Graxa Multiuso (kg)',                 'tipo' => 'oleo',   'unidade' => 'kg', 'estoque_minimo' => 10],
            ['codigo' => 'OL-006', 'nome' => 'Fluido de Freio DOT4',               'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 5],
            ['codigo' => 'OL-007', 'nome' => 'Aditivo para Radiador',              'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 10],
            // Outros
            ['codigo' => 'OT-001', 'nome' => 'Extintor CO2 2kg',                   'tipo' => 'outros', 'unidade' => 'un', 'estoque_minimo' => 5],
            ['codigo' => 'OT-002', 'nome' => 'Extintor Pó Químico 1kg',            'tipo' => 'outros', 'unidade' => 'un', 'estoque_minimo' => 8],
            ['codigo' => 'OT-003', 'nome' => 'Lâmpada H4 Farol (par)',             'tipo' => 'outros', 'unidade' => 'un', 'estoque_minimo' => 5],
            ['codigo' => 'OT-004', 'nome' => 'Fusível Automotivo Sortido (cx)',    'tipo' => 'outros', 'unidade' => 'cx', 'estoque_minimo' => 3],
            ['codigo' => 'OT-005', 'nome' => 'Pneu Borrachudo 275/80 R22.5',      'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'OT-006', 'nome' => 'Pneu 295/80 R22.5',                 'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'OT-007', 'nome' => 'Câmara de Ar 900x20',               'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 2],
        ];

        foreach ($itens as $item) {
            ItemEstoque::updateOrCreate(['codigo' => $item['codigo']], $item);
        }
    }

    private function seedPlanosManutencao(): void
    {
        // Plano para o Komatsu PC200-8 (horimetro-based)
        $komatsu = Equipamento::where('placa_serie', 'KMTPC180K51B30461')->first();
        if ($komatsu) {
            $plano = PlanoManutencao::updateOrCreate(
                ['equipamento_id' => $komatsu->id, 'nome' => 'Preventiva 250h — Escavadeira PC200'],
                ['descricao' => 'Manutenção preventiva a cada 250 horas de operação.', 'ativo' => true]
            );
            GatilhoPlano::updateOrCreate(
                ['plano_id' => $plano->id, 'tipo' => 'horas'],
                ['valor_intervalo' => 250, 'ultimo_valor_executado' => 9000, 'antecedencia_alerta' => 20]
            );
        }

        // Plano para CASE 580M (horimetro-based)
        $case = Equipamento::where('placa_serie', 'NAAH23022')->first();
        if ($case) {
            $plano = PlanoManutencao::updateOrCreate(
                ['equipamento_id' => $case->id, 'nome' => 'Preventiva 200h — Retroescavadeira 580M'],
                ['descricao' => 'Revisão preventiva a cada 200 horas: óleo, filtros, sistema hidráulico.', 'ativo' => true]
            );
            GatilhoPlano::updateOrCreate(
                ['plano_id' => $plano->id, 'tipo' => 'horas'],
                ['valor_intervalo' => 200, 'ultimo_valor_executado' => 7200, 'antecedencia_alerta' => 15]
            );
        }

        // Plano para VW 24.250 GPL-0002 (km-based)
        $vw01 = Equipamento::where('placa_serie', 'CNI-1611')->first();
        if ($vw01) {
            $plano = PlanoManutencao::updateOrCreate(
                ['equipamento_id' => $vw01->id, 'nome' => 'Preventiva 10.000km — VW 24.250'],
                ['descricao' => 'Troca de óleo e filtros a cada 10.000 km.', 'ativo' => true]
            );
            GatilhoPlano::updateOrCreate(
                ['plano_id' => $plano->id, 'tipo' => 'km'],
                ['valor_intervalo' => 10000, 'ultimo_valor_executado' => 110000, 'antecedencia_alerta' => 500]
            );
        }

        // Plano periódico mensal (motoniveladora CAT)
        $cat = Equipamento::where('placa_serie', '64007439')->first();
        if ($cat) {
            $plano = PlanoManutencao::updateOrCreate(
                ['equipamento_id' => $cat->id, 'nome' => 'Revisão Mensal — Motoniveladora CAT 120B'],
                ['descricao' => 'Inspeção mensal de sistema hidráulico, lâmina, pneus e freios.', 'ativo' => true]
            );
            GatilhoPlano::updateOrCreate(
                ['plano_id' => $plano->id, 'tipo' => 'periodicidade_dias'],
                ['valor_intervalo' => 30, 'ultimo_valor_executado' => 0, 'antecedencia_alerta' => 3,
                 'proxima_data_execucao' => now()->addDays(5)->toDateString()]
            );
        }
    }

    private function seedInstrucoesTrabalho(): void
    {
        // IT 1: Troca de Óleo — Caminhão Diesel
        $it1 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Troca de Óleo — Caminhão Diesel'],
            [
                'descricao' => 'Procedimento padrão de troca de óleo para caminhões movidos a diesel (Mercedes, Volkswagen, Ford, Iveco).',
                'tipo' => 'preventiva', 'prioridade' => 'media',
                'responsavel' => 'mecanico', 'status' => 'publicada',
            ]
        );

        $passos1 = [
            ['ordem' => 1, 'titulo' => 'Preparação e EPI',
             'descricao' => 'Calçar o veículo, acionar o freio de estacionamento. Usar luvas e óculos de proteção.',
             'alerta_seguranca' => 'Nunca trabalhar sob veículo sem calços nas rodas.'],
            ['ordem' => 2, 'titulo' => 'Aquecer o motor',
             'descricao' => 'Ligar o motor por 5 minutos para aquecer o óleo e facilitar o escoamento.'],
            ['ordem' => 3, 'titulo' => 'Drenar o óleo usado',
             'descricao' => 'Posicionar bandeja coletora. Remover o bujão de dreno e aguardar escoamento completo.'],
            ['ordem' => 4, 'titulo' => 'Substituir filtro de óleo',
             'descricao' => 'Remover o filtro antigo com chave cinta. Lubrificar a borracha do novo filtro com óleo limpo e instalar.'],
            ['ordem' => 5, 'titulo' => 'Reapertar bujão de dreno',
             'descricao' => 'Instalar nova arruela de cobre e apertar o bujão conforme torque do fabricante (30-40 Nm).'],
            ['ordem' => 6, 'titulo' => 'Abastecer com óleo novo',
             'descricao' => 'Preencher com óleo 15W40 diesel conforme capacidade do motor (consultar manual). Verificar nível na vareta.'],
            ['ordem' => 7, 'titulo' => 'Teste e verificação de vazamentos',
             'descricao' => 'Ligar o motor, aguardar pressurização, verificar se há vazamentos na tampa e no filtro.'],
            ['ordem' => 8, 'titulo' => 'Registrar no sistema',
             'descricao' => 'Anotar hodômetro, data, quantidade e tipo de óleo utilizado na OS.'],
        ];

        foreach ($passos1 as $p) {
            PassoIt::updateOrCreate(
                ['instrucao_trabalho_id' => $it1->id, 'ordem' => $p['ordem']],
                array_merge($p, ['instrucao_trabalho_id' => $it1->id])
            );
        }

        // IT 2: Inspeção de Sistema Hidráulico — Retroescavadeira
        $it2 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Inspeção do Sistema Hidráulico — Retroescavadeira'],
            [
                'descricao' => 'Inspeção periódica do sistema hidráulico de retroescavadeiras Case 580M, New Holland B110B e Volvo BL60B.',
                'tipo' => 'preditiva', 'prioridade' => 'alta',
                'responsavel' => 'mecanico', 'status' => 'publicada',
            ]
        );

        $passos2 = [
            ['ordem' => 1, 'titulo' => 'Verificar nível do fluido hidráulico',
             'descricao' => 'Com a máquina nivelada e balde retraído, verificar nível no visor ou vareta do reservatório.'],
            ['ordem' => 2, 'titulo' => 'Inspecionar mangueiras e conexões',
             'descricao' => 'Verificar todas as mangueiras hidráulicas quanto a vazamentos, rachaduras e desgaste.'],
            ['ordem' => 3, 'titulo' => 'Verificar cilindros hidráulicos',
             'descricao' => 'Inspecionar haste dos cilindros quanto a riscos, corrosão e vazamento de óleo pelo retém.',
             'alerta_seguranca' => 'Nunca trabalhar com a concha ou braço suspensos sem suporte mecânico.'],
            ['ordem' => 4, 'titulo' => 'Substituir filtro hidráulico',
             'descricao' => 'A cada 500h ou conforme alarme, substituir o filtro retorno do reservatório hidráulico.'],
            ['ordem' => 5, 'titulo' => 'Testar pressão do sistema',
             'descricao' => 'Com manômetro, verificar pressão de trabalho conforme especificação do fabricante (200-250 bar).'],
            ['ordem' => 6, 'titulo' => 'Verificar temperatura de operação',
             'descricao' => 'Operar a máquina por 10 minutos e verificar temperatura do fluido (máx. 80°C).'],
        ];

        foreach ($passos2 as $p) {
            PassoIt::updateOrCreate(
                ['instrucao_trabalho_id' => $it2->id, 'ordem' => $p['ordem']],
                array_merge($p, ['instrucao_trabalho_id' => $it2->id])
            );
        }

        // IT 3: Revisão de Pneus — Frota Pesada
        $it3 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Revisão de Pneus — Frota Pesada'],
            [
                'descricao' => 'Procedimento de inspeção e calibração de pneus para caminhões (275/80 R22.5, 295/80 R22.5) e máquinas pesadas.',
                'tipo' => 'preventiva', 'prioridade' => 'media',
                'responsavel' => 'mecanico', 'status' => 'publicada',
            ]
        );

        $passos3 = [
            ['ordem' => 1, 'titulo' => 'Inspecionar estado visual dos pneus',
             'descricao' => 'Verificar desgaste uniforme, cortes, bolhas e profundidade dos sulcos (mínimo 1,6mm, recomendar 3mm).'],
            ['ordem' => 2, 'titulo' => 'Verificar calibragem',
             'descricao' => 'Com calibrador digital, aferir pressão dos pneus a frio: dianteiros 105 psi, traseiros 95 psi (verificar etiqueta do veículo).'],
            ['ordem' => 3, 'titulo' => 'Inspecionar parafusos de roda',
             'descricao' => 'Verificar torque dos parafusos com torquímetro. Padrão rodas de aço: 550-600 Nm.'],
            ['ordem' => 4, 'titulo' => 'Verificar câmaras e válvulas',
             'descricao' => 'Inspecionar válvulas de encher quanto a vazamentos. Substituir tampas de válvula ausentes.'],
            ['ordem' => 5, 'titulo' => 'Registrar e programar rodízio',
             'descricao' => 'Registrar estado de cada pneu na OS. Programar rodízio a cada 30.000 km.'],
        ];

        foreach ($passos3 as $p) {
            PassoIt::updateOrCreate(
                ['instrucao_trabalho_id' => $it3->id, 'ordem' => $p['ordem']],
                array_merge($p, ['instrucao_trabalho_id' => $it3->id])
            );
        }

        // IT 4: Revisão Geral — Veículo Leve
        $it4 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Revisão Geral — Veículo Leve (Flex/Gasolina)'],
            [
                'descricao' => 'Revisão periódica para veículos leves (Gol, Voyage, Up, Saveiro, Fox, Kombi).',
                'tipo' => 'preventiva', 'prioridade' => 'baixa',
                'responsavel' => 'mecanico', 'status' => 'publicada',
            ]
        );

        $passos4 = [
            ['ordem' => 1, 'titulo' => 'Troca de óleo e filtro', 'descricao' => 'Drenar óleo 5W30 e substituir filtro. Verificar nível.'],
            ['ordem' => 2, 'titulo' => 'Verificar freios',      'descricao' => 'Inspecionar pastilhas dianteiras e lonas traseiras. Medir espessura.'],
            ['ordem' => 3, 'titulo' => 'Verificar suspensão',   'descricao' => 'Inspecionar amortecedores, bandejas, pivôs e terminais de direção.'],
            ['ordem' => 4, 'titulo' => 'Verificar fluidos',     'descricao' => 'Verificar nível de fluido de freio, água do radiador e líquido de direção.'],
            ['ordem' => 5, 'titulo' => 'Verificar pneus',       'descricao' => 'Calibrar pneus (30 psi dianteiro / 32 psi traseiro). Verificar desgaste.'],
            ['ordem' => 6, 'titulo' => 'Verificar luzes',       'descricao' => 'Testar faróis, lanternas, pisca-pisca e luz de freio.'],
            ['ordem' => 7, 'titulo' => 'Verificar bateria',     'descricao' => 'Verificar terminais, nível de eletrólito e carga da bateria.'],
        ];

        foreach ($passos4 as $p) {
            PassoIt::updateOrCreate(
                ['instrucao_trabalho_id' => $it4->id, 'ordem' => $p['ordem']],
                array_merge($p, ['instrucao_trabalho_id' => $it4->id])
            );
        }

        // IT 5: Lubrificação de Articulações — Máquinas Pesadas
        $it5 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Lubrificação de Articulações — Máquinas Pesadas'],
            [
                'descricao' => 'Procedimento de engraxamento de todos os pontos de articulação de escavadeiras, retroescavadeiras, pás e motoniveladoras.',
                'tipo' => 'preventiva', 'prioridade' => 'media',
                'responsavel' => 'mecanico', 'status' => 'publicada',
            ]
        );

        $passos5 = [
            ['ordem' => 1, 'titulo' => 'Identificar pontos de engraxamento',
             'descricao' => 'Consultar manual do fabricante para localizar todos os niples de engraxamento (braço, concha, lança, eixo).'],
            ['ordem' => 2, 'titulo' => 'Limpar niples antes de engraxar',
             'descricao' => 'Limpar cada niple com pano limpo para evitar contaminação da graxa com terra.'],
            ['ordem' => 3, 'titulo' => 'Aplicar graxa com pistola',
             'descricao' => 'Aplicar graxa multiuso até expulsar a graxa velha. Verificar articulação manual após cada ponto.',
             'alerta_seguranca' => 'Manter distância das articulações durante o movimento da máquina.'],
            ['ordem' => 4, 'titulo' => 'Verificar pino central de giro (swing)',
             'descricao' => 'Verificar engraxamento do anel de giro conforme intervalo do fabricante (a cada 50h-100h).'],
            ['ordem' => 5, 'titulo' => 'Registrar pontos lubrificados',
             'descricao' => 'Anotar quantidade de pontos lubrificados e consumo de graxa na OS.'],
        ];

        foreach ($passos5 as $p) {
            PassoIt::updateOrCreate(
                ['instrucao_trabalho_id' => $it5->id, 'ordem' => $p['ordem']],
                array_merge($p, ['instrucao_trabalho_id' => $it5->id])
            );
        }
    }

    private function seedChecklists(): void
    {
        // Checklist Diário — Caminhão
        $modelo1 = ModeloChecklist::updateOrCreate(
            ['nome' => 'Checklist Pré-Operacional — Caminhão'],
            ['tipo_equipamento' => 'caminhao', 'periodicidade' => 'diario', 'ativo' => true]
        );

        $itens1 = [
            ['descricao' => 'Nível de óleo do motor',             'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 1],
            ['descricao' => 'Nível de água do radiador',          'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 2],
            ['descricao' => 'Nível de fluido de freio',           'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 3],
            ['descricao' => 'Pressão dos pneus (visual)',         'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 4],
            ['descricao' => 'Funcionamento das luzes',            'tipo_resposta' => 'ok_nok',        'critico' => false, 'ordem' => 5],
            ['descricao' => 'Extintor de incêndio presente',      'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 6],
            ['descricao' => 'Freio de estacionamento funcionando','tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 7],
            ['descricao' => 'Hodômetro atual (km)',               'tipo_resposta' => 'valor_numerico', 'critico' => false, 'ordem' => 8],
            ['descricao' => 'Observações do motorista',           'tipo_resposta' => 'texto',         'critico' => false, 'ordem' => 9],
        ];

        foreach ($itens1 as $item) {
            ItemChecklist::updateOrCreate(
                ['modelo_id' => $modelo1->id, 'descricao' => $item['descricao']],
                array_merge($item, ['modelo_id' => $modelo1->id])
            );
        }

        // Checklist Diário — Máquina Pesada
        $modelo2 = ModeloChecklist::updateOrCreate(
            ['nome' => 'Checklist Pré-Operacional — Máquina Pesada'],
            ['tipo_equipamento' => 'maquina_pesada', 'periodicidade' => 'diario', 'ativo' => true]
        );

        $itens2 = [
            ['descricao' => 'Nível de óleo do motor',             'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 1],
            ['descricao' => 'Nível do fluido hidráulico',         'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 2],
            ['descricao' => 'Nível de água do radiador',          'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 3],
            ['descricao' => 'Mangueiras hidráulicas sem vazamento','tipo_resposta' => 'ok_nok',       'critico' => true,  'ordem' => 4],
            ['descricao' => 'Estado das esteiras / pneus',        'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 5],
            ['descricao' => 'Funcionamento das luzes de trabalho','tipo_resposta' => 'ok_nok',        'critico' => false, 'ordem' => 6],
            ['descricao' => 'Buzina e alarme de ré funcionando',  'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 7],
            ['descricao' => 'Extintor de incêndio presente',      'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 8],
            ['descricao' => 'Horímetro atual (horas)',            'tipo_resposta' => 'valor_numerico', 'critico' => false, 'ordem' => 9],
            ['descricao' => 'Observações do operador',            'tipo_resposta' => 'texto',         'critico' => false, 'ordem' => 10],
        ];

        foreach ($itens2 as $item) {
            ItemChecklist::updateOrCreate(
                ['modelo_id' => $modelo2->id, 'descricao' => $item['descricao']],
                array_merge($item, ['modelo_id' => $modelo2->id])
            );
        }

        // Checklist Diário — Veículo Leve
        $modelo3 = ModeloChecklist::updateOrCreate(
            ['nome' => 'Checklist Pré-Operacional — Veículo Leve'],
            ['tipo_equipamento' => 'veiculo_leve', 'periodicidade' => 'diario', 'ativo' => true]
        );

        $itens3 = [
            ['descricao' => 'Nível de óleo do motor',             'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 1],
            ['descricao' => 'Nível de água do radiador',          'tipo_resposta' => 'ok_nok',        'critico' => false, 'ordem' => 2],
            ['descricao' => 'Funcionamento das luzes',            'tipo_resposta' => 'ok_nok',        'critico' => false, 'ordem' => 3],
            ['descricao' => 'Estado dos pneus (visual)',          'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 4],
            ['descricao' => 'Freios funcionando',                 'tipo_resposta' => 'ok_nok',        'critico' => true,  'ordem' => 5],
            ['descricao' => 'Hodômetro atual (km)',               'tipo_resposta' => 'valor_numerico', 'critico' => false, 'ordem' => 6],
        ];

        foreach ($itens3 as $item) {
            ItemChecklist::updateOrCreate(
                ['modelo_id' => $modelo3->id, 'descricao' => $item['descricao']],
                array_merge($item, ['modelo_id' => $modelo3->id])
            );
        }
    }
}
