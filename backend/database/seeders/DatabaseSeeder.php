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
use App\Models\Empresa;
use App\Models\CentroCusto;
use App\Models\Contrato;
use App\Models\Rodovia;
use App\Models\Trecho;
use App\Models\Atividade;
use App\Models\ItemContratual;
use App\Models\Colaborador;
use App\Models\EquipeCampo;
use App\Models\MotivoParada;
use App\Models\Programacao;
use App\Models\ProgramacaoItem;
use App\Models\ApontamentoProducao;
use App\Models\HorasEquipamento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedUsuarios();
        $this->seedEmpresa();
        $this->seedCentrosCusto();
        $this->seedContratos();
        $this->seedRodovias();
        $this->seedAtividades();
        $this->seedColaboradores();
        $this->seedEquipes();
        $this->seedMotivosParada();
        $this->seedFrota();
        $this->seedEstoque();
        $this->seedPlanosManutencao();
        $this->seedInstrucoesTrabalho();
        $this->seedChecklists();
        $this->seedProgramacoes();
        $this->seedApontamentos();
        $this->seedHorasEquipamento();
    }

    // ── Usuários ──────────────────────────────────────────────────────────
    private function seedUsuarios(): void
    {
        $usuarios = [
            // Diretoria / Gestão
            ['name' => 'Carlos Henrique Diretor',      'email' => 'diretor@primus.com',       'role' => 'gestor',     'setor' => 'Diretoria'],
            ['name' => 'Ana Paula Gestora',             'email' => 'gestor@primus.com',        'role' => 'gestor',     'setor' => 'Gestão Geral'],
            // Engenharia
            ['name' => 'Rodrigo Engenheiro Civil',      'email' => 'engenharia@primus.com',    'role' => 'engenheiro', 'setor' => 'Engenharia'],
            // PCP
            ['name' => 'Fernanda PCP',                  'email' => 'pcp@primus.com',           'role' => 'pcp',        'setor' => 'PCP'],
            // Operação
            ['name' => 'Ana Líder de Campo',            'email' => 'lider@primus.com',         'role' => 'lider_campo','setor' => 'Operações'],
            ['name' => 'Pedro Operador de Máquinas',    'email' => 'operador@primus.com',      'role' => 'operador',   'setor' => 'Campo'],
            ['name' => 'Paulo Motorista',               'email' => 'motorista@primus.com',     'role' => 'motorista',  'setor' => 'Logística'],
            ['name' => 'João Mecânico',                 'email' => 'mecanico@primus.com',      'role' => 'mecanico',   'setor' => 'Manutenção'],
            // Administrativo
            ['name' => 'Cláudia RH',                   'email' => 'rh@primus.com',            'role' => 'rh',         'setor' => 'RH'],
            ['name' => 'Marcos Qualidade',              'email' => 'qualidade@primus.com',     'role' => 'qualidade',  'setor' => 'Qualidade'],
            ['name' => 'Patrícia Segurança',            'email' => 'seguranca@primus.com',     'role' => 'seguranca_trabalho', 'setor' => 'SESMT'],
            ['name' => 'Roberto Almoxarife',            'email' => 'almoxarife@primus.com',    'role' => 'almoxarife', 'setor' => 'Almoxarifado'],
            // Legados
            ['name' => 'Marcos Diretor Legado',        'email' => 'diretoria@instrucao.com',  'role' => 'gestor',     'setor' => 'Diretoria'],
            ['name' => 'Carlos Gestor de Manutenção',  'email' => 'gestor@instrucao.com',     'role' => 'gestor',     'setor' => 'Manutenção'],
            ['name' => 'Ricardo Gestor de Produção',   'email' => 'producao@instrucao.com',   'role' => 'lider_campo','setor' => 'Produção'],
            ['name' => 'Sandra Gestora Suprimentos',   'email' => 'suprimentos@instrucao.com','role' => 'lider_campo','setor' => 'Suprimentos'],
            ['name' => 'Fernanda PCP Legado',          'email' => 'pcp@instrucao.com',        'role' => 'lider_campo','setor' => 'PCP'],
            ['name' => 'Felipe Líder',                 'email' => 'lider@instrucao.com',      'role' => 'lider_campo','setor' => 'Campo'],
            ['name' => 'Fernando Encarregado',         'email' => 'encarregado@instrucao.com','role' => 'mecanico',   'setor' => 'Manutenção'],
            ['name' => 'Pedro Operador Legado',        'email' => 'operador@instrucao.com',   'role' => 'operador',   'setor' => 'Campo'],
            ['name' => 'Lucas Motorista Legado',       'email' => 'motorista@instrucao.com',  'role' => 'operador',   'setor' => 'Logística'],
            ['name' => 'Waldemiro Operador',           'email' => 'waldemiro@instrucao.com',  'role' => 'operador',   'setor' => 'Campo'],
            ['name' => 'João Mecânico Legado',         'email' => 'mecanico@instrucao.com',   'role' => 'mecanico',   'setor' => 'Manutenção'],
        ];

        foreach ($usuarios as $u) {
            User::updateOrCreate(['email' => $u['email']], array_merge($u, [
                'password' => Hash::make('123456'),
                'ativo' => true,
            ]));
        }
    }

    // ── Empresa ───────────────────────────────────────────────────────────
    private function seedEmpresa(): void
    {
        Empresa::updateOrCreate(['cnpj' => '12.345.678/0001-90'], [
            'razao_social'   => 'GPL — Gestão e Pavimentação Ltda.',
            'nome_fantasia'  => 'GPL Engenharia',
            'endereco'       => 'Rua das Palmeiras, 1250',
            'cidade'         => 'Araçatuba',
            'uf'             => 'SP',
            'telefone'       => '(18) 3300-1000',
            'email'          => 'contato@gplengenharia.com.br',
            'ativo'          => true,
        ]);
    }

    // ── Centros de Custo ──────────────────────────────────────────────────
    private function seedCentrosCusto(): void
    {
        $empresa = Empresa::first();
        if (!$empresa) return;

        $ccs = [
            ['codigo' => 'CC-001', 'nome' => 'Engenharia',         'descricao' => 'Projetos e engenharia de campo'],
            ['codigo' => 'CC-002', 'nome' => 'Conserva DER',       'descricao' => 'Contratos de conserva rodoviária DER-SP'],
            ['codigo' => 'CC-003', 'nome' => 'Terraplanagem',      'descricao' => 'Serviços de terraplenagem e aterro'],
            ['codigo' => 'CC-004', 'nome' => 'Manutenção',         'descricao' => 'Manutenção de máquinas e frota'],
            ['codigo' => 'CC-005', 'nome' => 'Produção',           'descricao' => 'Operações de campo e produção'],
            ['codigo' => 'CC-006', 'nome' => 'Geral',              'descricao' => 'Despesas administrativas gerais'],
            ['codigo' => 'CC-007', 'nome' => 'Logística',          'descricao' => 'Transporte e logística de insumos'],
            ['codigo' => 'CC-008', 'nome' => 'Pavimentação',       'descricao' => 'Pavimentação asfáltica e TSD'],
        ];

        foreach ($ccs as $cc) {
            CentroCusto::updateOrCreate(
                ['codigo' => $cc['codigo']],
                array_merge($cc, ['empresa_id' => $empresa->id, 'ativo' => true])
            );
        }
    }

    // ── Contratos ─────────────────────────────────────────────────────────
    private function seedContratos(): void
    {
        $empresa = Empresa::first();
        $ccConserva = CentroCusto::where('codigo', 'CC-002')->first();
        $ccTerra    = CentroCusto::where('codigo', 'CC-003')->first();
        $ccPavi     = CentroCusto::where('codigo', 'CC-008')->first();
        if (!$empresa) return;

        $contratos = [
            [
                'numero'           => 'DER-2024-001',
                'objeto'           => 'Conserva e melhoramentos da SP-310 — Trecho Araçatuba/Birigui',
                'cliente'          => 'DER-SP',
                'orgao_contratante'=> 'Departamento de Estradas de Rodagem',
                'tipo'             => 'conserva',
                'data_inicio'      => '2024-01-15',
                'data_fim'         => '2025-01-14',
                'valor_inicial'    => 4850000.00,
                'valor_atualizado' => 5120000.00,
                'status'           => 'ativo',
                'empresa_id'       => $empresa->id,
                'centro_custo_id'  => $ccConserva?->id,
            ],
            [
                'numero'           => 'DER-2024-002',
                'objeto'           => 'Conserva SP-461 — Trecho Penápolis/Birigui',
                'cliente'          => 'DER-SP',
                'orgao_contratante'=> 'Departamento de Estradas de Rodagem',
                'tipo'             => 'conserva',
                'data_inicio'      => '2024-03-01',
                'data_fim'         => '2025-02-28',
                'valor_inicial'    => 2980000.00,
                'valor_atualizado' => 2980000.00,
                'status'           => 'ativo',
                'empresa_id'       => $empresa->id,
                'centro_custo_id'  => $ccConserva?->id,
            ],
            [
                'numero'           => 'PREF-2024-003',
                'objeto'           => 'Terraplenagem e drenagem — Loteamento Industrial Norte',
                'cliente'          => 'Prefeitura de Araçatuba',
                'orgao_contratante'=> 'Secretaria de Obras',
                'tipo'             => 'terraplenagem',
                'data_inicio'      => '2024-04-10',
                'data_fim'         => '2024-12-31',
                'valor_inicial'    => 1650000.00,
                'valor_atualizado' => 1820000.00,
                'status'           => 'ativo',
                'empresa_id'       => $empresa->id,
                'centro_custo_id'  => $ccTerra?->id,
            ],
            [
                'numero'           => 'DER-2024-004',
                'objeto'           => 'Recapeamento asfáltico SP-595 — Km 48 a Km 72',
                'cliente'          => 'DER-SP',
                'orgao_contratante'=> 'Departamento de Estradas de Rodagem',
                'tipo'             => 'pavimentacao',
                'data_inicio'      => '2024-06-01',
                'data_fim'         => '2025-05-31',
                'valor_inicial'    => 7340000.00,
                'valor_atualizado' => 7340000.00,
                'status'           => 'ativo',
                'empresa_id'       => $empresa->id,
                'centro_custo_id'  => $ccPavi?->id,
            ],
        ];

        foreach ($contratos as $c) {
            Contrato::updateOrCreate(['numero' => $c['numero']], $c);
        }

        // Itens contratuais para o primeiro contrato
        $c1 = Contrato::where('numero', 'DER-2024-001')->first();
        if ($c1) {
            $atRemendo = Atividade::where('codigo', 'AT-006')->first();
            $atRocada  = Atividade::where('codigo', 'AT-010')->first();
            $atDren    = Atividade::where('codigo', 'AT-007')->first();
            $itens = [
                ['codigo_item' => 'I-001', 'descricao' => 'Remendo Profundo com CAUQ',         'unidade' => 'm²', 'quantidade_contratada' => 12000, 'quantidade_medida' => 7840, 'preco_unitario' => 85.50, 'atividade_id' => $atRemendo?->id],
                ['codigo_item' => 'I-002', 'descricao' => 'Roçada Manual com retirada',        'unidade' => 'm²', 'quantidade_contratada' => 280000,'quantidade_medida' => 198000,'preco_unitario'=> 1.20, 'atividade_id' => $atRocada?->id],
                ['codigo_item' => 'I-003', 'descricao' => 'Limpeza de bueiro e dreno',        'unidade' => 'un', 'quantidade_contratada' => 320,   'quantidade_medida' => 198,   'preco_unitario' => 95.00, 'atividade_id' => $atDren?->id],
                ['codigo_item' => 'I-004', 'descricao' => 'Recomposição de aterro compactado','unidade' => 'm³', 'quantidade_contratada' => 8500,  'quantidade_medida' => 3200,  'preco_unitario' => 42.00, 'atividade_id' => null],
                ['codigo_item' => 'I-005', 'descricao' => 'Sinalização horizontal — faixa',   'unidade' => 'm',  'quantidade_contratada' => 15000, 'quantidade_medida' => 9400,  'preco_unitario' => 8.50,  'atividade_id' => null],
            ];
            foreach ($itens as $item) {
                ItemContratual::updateOrCreate(
                    ['contrato_id' => $c1->id, 'codigo_item' => $item['codigo_item']],
                    array_merge($item, ['contrato_id' => $c1->id])
                );
            }
        }
    }

    // ── Rodovias ──────────────────────────────────────────────────────────
    private function seedRodovias(): void
    {
        $rodovias = [
            ['codigo' => 'SP-310', 'nome' => 'Rodovia Marechal Rondon',       'municipio' => 'Araçatuba / Birigui', 'uf' => 'SP'],
            ['codigo' => 'SP-461', 'nome' => 'Rodovia Dirceu dos Santos',     'municipio' => 'Penápolis / Birigui', 'uf' => 'SP'],
            ['codigo' => 'SP-595', 'nome' => 'Rodovia Julio Berbel',          'municipio' => 'Araçatuba / Andradina', 'uf' => 'SP'],
            ['codigo' => 'SP-463', 'nome' => 'Rodovia Waldomiro Correa Lima', 'municipio' => 'Araçatuba', 'uf' => 'SP'],
            ['codigo' => 'SP-294', 'nome' => 'Rodovia Comandante João Ribeiro de Barros', 'municipio' => 'Marília / Araçatuba', 'uf' => 'SP'],
        ];

        foreach ($rodovias as $r) {
            Rodovia::updateOrCreate(['codigo' => $r['codigo']], $r);
        }

        // Trechos do contrato DER-2024-001
        $c1 = Contrato::where('numero', 'DER-2024-001')->first();
        $sp310 = Rodovia::where('codigo', 'SP-310')->first();
        if ($c1 && $sp310) {
            $trechos = [
                ['descricao' => 'SP-310 — Km 418 a Km 432', 'km_inicial' => 418.0, 'km_final' => 432.0, 'municipio' => 'Araçatuba'],
                ['descricao' => 'SP-310 — Km 432 a Km 451', 'km_inicial' => 432.0, 'km_final' => 451.0, 'municipio' => 'Birigui'],
            ];
            foreach ($trechos as $t) {
                Trecho::updateOrCreate(
                    ['contrato_id' => $c1->id, 'descricao' => $t['descricao']],
                    array_merge($t, ['contrato_id' => $c1->id, 'rodovia_id' => $sp310->id, 'ativo' => true])
                );
            }
        }
    }

    // ── Atividades ────────────────────────────────────────────────────────
    private function seedAtividades(): void
    {
        $atividades = [
            // Pavimentação
            ['codigo' => 'AT-001', 'nome' => 'Tapa-buraco com CBUQ',              'categoria' => 'pavimentacao', 'unidade_medida' => 'm²'],
            ['codigo' => 'AT-002', 'nome' => 'Remendo superficial com PMF',       'categoria' => 'pavimentacao', 'unidade_medida' => 'm²'],
            ['codigo' => 'AT-003', 'nome' => 'Capa asfáltica — CBUQ usinado',     'categoria' => 'pavimentacao', 'unidade_medida' => 'm²'],
            ['codigo' => 'AT-004', 'nome' => 'Tratamento Superficial Duplo (TSD)','categoria' => 'pavimentacao', 'unidade_medida' => 'm²'],
            ['codigo' => 'AT-005', 'nome' => 'Fresagem de pavimento asfáltico',   'categoria' => 'pavimentacao', 'unidade_medida' => 'm²'],
            ['codigo' => 'AT-006', 'nome' => 'Remendo profundo com CAUQ',         'categoria' => 'pavimentacao', 'unidade_medida' => 'm²'],
            // Drenagem
            ['codigo' => 'AT-007', 'nome' => 'Limpeza de bueiro e caixa de drenagem','categoria' => 'drenagem', 'unidade_medida' => 'un'],
            ['codigo' => 'AT-008', 'nome' => 'Limpeza de sarjeta e canaleta',     'categoria' => 'drenagem',    'unidade_medida' => 'm'],
            ['codigo' => 'AT-009', 'nome' => 'Recomposição de revestimento de canaleta','categoria'=>'drenagem','unidade_medida' => 'm'],
            // Vegetação
            ['codigo' => 'AT-010', 'nome' => 'Roçada manual com retirada',        'categoria' => 'conserva',    'unidade_medida' => 'm²'],
            ['codigo' => 'AT-011', 'nome' => 'Roçada mecanizada',                 'categoria' => 'conserva',    'unidade_medida' => 'm²'],
            ['codigo' => 'AT-012', 'nome' => 'Capina e limpeza de faixa',         'categoria' => 'conserva',    'unidade_medida' => 'm²'],
            // Terraplenagem
            ['codigo' => 'AT-013', 'nome' => 'Corte de material de 1ª categoria', 'categoria' => 'terraplenagem','unidade_medida' => 'm³'],
            ['codigo' => 'AT-014', 'nome' => 'Aterro compactado',                 'categoria' => 'terraplenagem','unidade_medida' => 'm³'],
            ['codigo' => 'AT-015', 'nome' => 'Retaludamento de talude',           'categoria' => 'terraplenagem','unidade_medida' => 'm²'],
            ['codigo' => 'AT-016', 'nome' => 'Recomposição de aterro',            'categoria' => 'terraplenagem','unidade_medida' => 'm³'],
            // Sinalização
            ['codigo' => 'AT-017', 'nome' => 'Pintura de faixa contínua',        'categoria' => 'sinalizacao',  'unidade_medida' => 'm'],
            ['codigo' => 'AT-018', 'nome' => 'Pintura de faixa tracejada',       'categoria' => 'sinalizacao',  'unidade_medida' => 'm'],
            ['codigo' => 'AT-019', 'nome' => 'Implantação de placa de sinalização','categoria'=> 'sinalizacao', 'unidade_medida' => 'un'],
            // Manutenção
            ['codigo' => 'AT-020', 'nome' => 'Manutenção preventiva — máquina',  'categoria' => 'manutencao',   'unidade_medida' => 'h'],
            ['codigo' => 'AT-021', 'nome' => 'Manutenção corretiva — máquina',   'categoria' => 'manutencao',   'unidade_medida' => 'h'],
        ];

        foreach ($atividades as $a) {
            Atividade::updateOrCreate(['codigo' => $a['codigo']], array_merge($a, ['ativo' => true]));
        }
    }

    // ── Colaboradores ─────────────────────────────────────────────────────
    private function seedColaboradores(): void
    {
        $empresa = Empresa::first();
        if (!$empresa) return;

        $colaboradores = [
            // Líderes / Encarregados
            ['matricula' => 'F-001', 'nome' => 'Ana Líder de Campo',       'funcao' => 'Líder de Campo',       'setor' => 'Operações', 'status' => 'ativo', 'cnh_categoria' => 'B'],
            ['matricula' => 'F-002', 'nome' => 'Roberto Encarregado',      'funcao' => 'Encarregado de Equipe','setor' => 'Operações', 'status' => 'ativo', 'cnh_categoria' => 'D'],
            ['matricula' => 'F-003', 'nome' => 'Mário Apontador',          'funcao' => 'Apontador',            'setor' => 'PCP',       'status' => 'ativo', 'cnh_categoria' => 'B'],
            // Operadores de Máquinas
            ['matricula' => 'F-010', 'nome' => 'Pedro Operador de Máquinas','funcao' => 'Operador de Máquinas', 'setor' => 'Campo', 'status' => 'ativo', 'cnh_categoria' => 'C'],
            ['matricula' => 'F-011', 'nome' => 'Valdemir Operador',         'funcao' => 'Operador de Máquinas', 'setor' => 'Campo', 'status' => 'ativo', 'cnh_categoria' => null],
            ['matricula' => 'F-012', 'nome' => 'Waldemiro Silva',           'funcao' => 'Operador de Retroescavadeira','setor' => 'Campo','status'=>'ativo','cnh_categoria'=> null],
            ['matricula' => 'F-013', 'nome' => 'Edson Operador de Rolo',   'funcao' => 'Operador de Rolo',     'setor' => 'Campo', 'status' => 'ativo', 'cnh_categoria' => null],
            // Motoristas
            ['matricula' => 'F-020', 'nome' => 'Paulo Motorista',          'funcao' => 'Motorista',            'setor' => 'Logística','status'=> 'ativo', 'cnh_categoria' => 'E'],
            ['matricula' => 'F-021', 'nome' => 'Lucas Caminhoneiro',       'funcao' => 'Motorista',            'setor' => 'Logística','status'=> 'ativo', 'cnh_categoria' => 'E'],
            ['matricula' => 'F-022', 'nome' => 'José Motorista',           'funcao' => 'Motorista',            'setor' => 'Logística','status'=> 'ativo', 'cnh_categoria' => 'D'],
            ['matricula' => 'F-023', 'nome' => 'Carlos Motorista 2',       'funcao' => 'Motorista',            'setor' => 'Logística','status'=> 'afastado','cnh_categoria' => 'E'],
            // Mecânicos
            ['matricula' => 'F-030', 'nome' => 'João Mecânico',            'funcao' => 'Mecânico',             'setor' => 'Manutenção','status'=>'ativo', 'cnh_categoria' => 'B'],
            ['matricula' => 'F-031', 'nome' => 'Fernando Mecânico Auxiliar','funcao'=> 'Auxiliar de Mecânico', 'setor' => 'Manutenção','status'=>'ativo', 'cnh_categoria' => null],
            // Serventes / Geral
            ['matricula' => 'F-040', 'nome' => 'Antonio Servente',        'funcao' => 'Servente de Obras',    'setor' => 'Campo',     'status' => 'ativo', 'cnh_categoria' => null],
            ['matricula' => 'F-041', 'nome' => 'Benedito Pedreiro',       'funcao' => 'Pedreiro',             'setor' => 'Campo',     'status' => 'ativo', 'cnh_categoria' => null],
            ['matricula' => 'F-042', 'nome' => 'Cícero Ajudante',         'funcao' => 'Ajudante Geral',       'setor' => 'Campo',     'status' => 'ativo', 'cnh_categoria' => null],
            ['matricula' => 'F-043', 'nome' => 'Divino Carpinteiro',      'funcao' => 'Carpinteiro',          'setor' => 'Campo',     'status' => 'ativo', 'cnh_categoria' => null],
            ['matricula' => 'F-044', 'nome' => 'Edevaldo Eletricista',    'funcao' => 'Eletricista de Manutenção','setor'=>'Manutenção','status'=>'ativo','cnh_categoria'=> 'B'],
        ];

        foreach ($colaboradores as $c) {
            Colaborador::updateOrCreate(
                ['matricula' => $c['matricula']],
                array_merge($c, [
                    'empresa_id' => $empresa->id,
                    'vinculo' => 'clt',
                    'data_admissao' => '2022-01-03',
                    'aso_validade' => '2025-12-31',
                ])
            );
        }
    }

    // ── Equipes de Campo ──────────────────────────────────────────────────
    private function seedEquipes(): void
    {
        $empresa = Empresa::first();
        $c1 = Contrato::where('numero', 'DER-2024-001')->first();
        $c2 = Contrato::where('numero', 'DER-2024-002')->first();
        $c3 = Contrato::where('numero', 'PREF-2024-003')->first();
        if (!$empresa) return;

        $liderA = Colaborador::where('matricula', 'F-001')->first();
        $liderB = Colaborador::where('matricula', 'F-002')->first();

        $equipes = [
            ['nome' => 'Equipe A — Conserva DER',    'tipo' => 'conserva',      'contrato_id' => $c1?->id, 'lider_id' => $liderA?->id],
            ['nome' => 'Equipe B — Terraplenagem',   'tipo' => 'terraplenagem', 'contrato_id' => $c3?->id, 'lider_id' => $liderB?->id],
            ['nome' => 'Equipe C — Drenagem e Obras','tipo' => 'drenagem',      'contrato_id' => $c1?->id, 'lider_id' => null],
            ['nome' => 'Equipe D — SP-461 Conserva', 'tipo' => 'conserva',      'contrato_id' => $c2?->id, 'lider_id' => $liderA?->id],
            ['nome' => 'Equipe E — Pavimentação',    'tipo' => 'pavimentacao',  'contrato_id' => null,     'lider_id' => $liderB?->id],
        ];

        foreach ($equipes as $e) {
            EquipeCampo::updateOrCreate(
                ['nome' => $e['nome']],
                array_merge($e, ['empresa_id' => $empresa->id, 'ativo' => true])
            );
        }

        $equipeA = EquipeCampo::where('nome', 'Equipe A — Conserva DER')->first();
        $equipeB = EquipeCampo::where('nome', 'Equipe B — Terraplenagem')->first();
        $equipeC = EquipeCampo::where('nome', 'Equipe C — Drenagem e Obras')->first();
        $equipeD = EquipeCampo::where('nome', 'Equipe D — SP-461 Conserva')->first();
        $equipeE = EquipeCampo::where('nome', 'Equipe E — Pavimentação')->first();

        $membros = [
            'F-001' => $equipeA, 'F-003' => $equipeA, 'F-010' => $equipeA, 'F-020' => $equipeA, 'F-040' => $equipeA,
            'F-002' => $equipeB, 'F-011' => $equipeB, 'F-021' => $equipeB, 'F-042' => $equipeB,
            'F-012' => $equipeC, 'F-041' => $equipeC, 'F-043' => $equipeC,
            'F-022' => $equipeD,
            'F-013' => $equipeE,
        ];

        foreach ($membros as $matricula => $equipe) {
            $colaborador = Colaborador::where('matricula', $matricula)->first();
            if (!$colaborador || !$equipe) continue;
            $equipe->colaboradores()->syncWithoutDetaching([
                $colaborador->id => ['funcao_na_equipe' => $colaborador->funcao],
            ]);
        }
    }

    // ── Motivos de Parada ─────────────────────────────────────────────────
    private function seedMotivosParada(): void
    {
        $motivos = [
            ['codigo' => 'MP-MAN-COR', 'descricao' => 'Manutenção corretiva',      'categoria' => 'mecanica'],
            ['codigo' => 'MP-MAN-PRE', 'descricao' => 'Manutenção preventiva',     'categoria' => 'mecanica'],
            ['codigo' => 'MP-FAL-OPE', 'descricao' => 'Falta de operador',         'categoria' => 'operacional'],
            ['codigo' => 'MP-FAL-MOT', 'descricao' => 'Falta de motorista',        'categoria' => 'operacional'],
            ['codigo' => 'MP-CHUVA',   'descricao' => 'Chuva / intempéries',       'categoria' => 'clima'],
            ['codigo' => 'MP-SOLO',    'descricao' => 'Solo saturado',              'categoria' => 'clima'],
            ['codigo' => 'MP-IMP-CLI', 'descricao' => 'Impedimento do cliente',    'categoria' => 'operacional'],
            ['codigo' => 'MP-FAL-MAT', 'descricao' => 'Falta de material/insumo', 'categoria' => 'logistica'],
            ['codigo' => 'MP-FAL-FRE', 'descricao' => 'Falta de frente de serviço','categoria' => 'operacional'],
            ['codigo' => 'MP-DESLO',   'descricao' => 'Deslocamento',              'categoria' => 'logistica'],
            ['codigo' => 'MP-AGU-CAR', 'descricao' => 'Aguardando carga',          'categoria' => 'logistica'],
            ['codigo' => 'MP-AGU-DES', 'descricao' => 'Aguardando descarga',       'categoria' => 'logistica'],
            ['codigo' => 'MP-DOC',     'descricao' => 'Falta de documentação',     'categoria' => 'operacional'],
            ['codigo' => 'MP-ACID',    'descricao' => 'Acidente',                  'categoria' => 'outros'],
            ['codigo' => 'MP-OUTRO',   'descricao' => 'Outro motivo',              'categoria' => 'outros'],
        ];

        foreach ($motivos as $m) {
            MotivoParada::updateOrCreate(['codigo' => $m['codigo']], array_merge($m, ['ativo' => true]));
        }
    }

    // ── Frota ─────────────────────────────────────────────────────────────
    private function seedFrota(): void
    {
        $frota = [
            ['nome' => 'GPL-0001 — M.BENZ/ATEGO 1418 TOCO CAÇAMBA',   'tipo' => 'caminhao',    'modelo' => 'ATEGO 1418 TOCO',    'fabricante' => 'Mercedes-Benz', 'ano' => 2006, 'placa_serie' => 'HMG-6I78', 'horimetro_atual' => 0,     'hodometro_atual' => 148300, 'status' => 'ativo'],
            ['nome' => 'GPL-0002 — VW/24.250 CNC 6X2 CAÇAMBA',        'tipo' => 'caminhao',    'modelo' => '24.250 CNC 6X2',     'fabricante' => 'Volkswagen',    'ano' => 2011, 'placa_serie' => 'CNI-1611', 'horimetro_atual' => 0,     'hodometro_atual' => 112500, 'status' => 'ativo'],
            ['nome' => 'GPL-0003 — VW/24.250 CNC 6X2 CAÇAMBA',        'tipo' => 'caminhao',    'modelo' => '24.250 CNC 6X2',     'fabricante' => 'Volkswagen',    'ano' => 2010, 'placa_serie' => 'EHH-7D74', 'horimetro_atual' => 0,     'hodometro_atual' => 124800, 'status' => 'ativo'],
            ['nome' => 'GPL-0004 — M.BENZ/ACCELO 915C BAÚ',           'tipo' => 'caminhao',    'modelo' => 'ACCELO 915C',        'fabricante' => 'Mercedes-Benz', 'ano' => 2007, 'placa_serie' => 'CVN-4A86', 'horimetro_atual' => 0,     'hodometro_atual' => 97600,  'status' => 'ativo'],
            ['nome' => 'GPL-0005 — FORD/CARGO 1319',                   'tipo' => 'caminhao',    'modelo' => 'CARGO 1319',         'fabricante' => 'Ford',          'ano' => 2012, 'placa_serie' => 'ERE-4F64', 'horimetro_atual' => 0,     'hodometro_atual' => 83200,  'status' => 'ativo'],
            ['nome' => 'GPL-0006 — FORD/F12000',                       'tipo' => 'caminhao',    'modelo' => 'F12000',             'fabricante' => 'Ford',          'ano' => 1994, 'placa_serie' => 'CAZ-2J31', 'horimetro_atual' => 0,     'hodometro_atual' => 342000, 'status' => 'em_manutencao'],
            ['nome' => 'GPL-0007 — IVECO/DAILY CAMPO 4013 4X4',       'tipo' => 'caminhao',    'modelo' => 'DAILY CAMPO 4013 4X4','fabricante' => 'Iveco',         'ano' => 2007, 'placa_serie' => 'DXH-1352', 'horimetro_atual' => 0,     'hodometro_atual' => 178400, 'status' => 'ativo'],
            ['nome' => 'GPL-0008 — DODGE/900 PIPA',                    'tipo' => 'caminhao',    'modelo' => 'DODGE 900',          'fabricante' => 'Dodge',         'ano' => 1972, 'placa_serie' => 'BXS-6647', 'horimetro_atual' => 0,     'hodometro_atual' => 0,      'status' => 'ativo'],
            ['nome' => 'GPL-0009 — VW/19.320 CLC TT CAVALO MECÂNICO', 'tipo' => 'caminhao',    'modelo' => '19.320 CLC TT',      'fabricante' => 'Volkswagen',    'ano' => 2008, 'placa_serie' => 'DPB-7I47', 'horimetro_atual' => 0,     'hodometro_atual' => 214600, 'status' => 'ativo'],
            ['nome' => 'GPL-0010 — REB/TRIVELLATO CARRETA PLATAFORMA', 'tipo' => 'reboque',     'modelo' => 'CARRETA PLATAFORMA', 'fabricante' => 'Trivellato',    'ano' => 1969, 'placa_serie' => 'BSG-8241', 'horimetro_atual' => 0,     'hodometro_atual' => 0,      'status' => 'ativo'],
            ['nome' => 'GPL-0011 — KOMATSU ESCAVADEIRA PC200-8',       'tipo' => 'maquina_pesada','modelo' => 'PC200-8',          'fabricante' => 'Komatsu',       'ano' => 2009, 'placa_serie' => 'KMTPC180K51B30461','horimetro_atual'=>9240,'hodometro_atual'=> 0,   'status' => 'ativo'],
            ['nome' => 'GPL-0012 — FORD/CARGO 1317 + MUNCK',           'tipo' => 'caminhao',    'modelo' => 'CARGO 1317',         'fabricante' => 'Ford',          'ano' => 2005, 'placa_serie' => 'DKX-7811', 'horimetro_atual' => 0,     'hodometro_atual' => 192300, 'status' => 'ativo'],
            ['nome' => 'GPL-0013 — VW/NOVO GOL TL MCV',                'tipo' => 'veiculo_leve','modelo' => 'Novo Gol TL MCV',   'fabricante' => 'Volkswagen',    'ano' => 2016, 'placa_serie' => 'BAQ-6D60', 'horimetro_atual' => 0,     'hodometro_atual' => 68400,  'status' => 'ativo'],
            ['nome' => 'GPL-0015 — MAXXOR PÁ CARREGADEIRA',            'tipo' => 'maquina_pesada','modelo' => 'PÁ CARREGADEIRA', 'fabricante' => 'Maxxor',        'ano' => 2013, 'placa_serie' => 'GPL-0015', 'horimetro_atual' => 5480,  'hodometro_atual' => 0,      'status' => 'ativo'],
            ['nome' => 'GPL-0016 — CATERPILLAR PATROL 120B',           'tipo' => 'maquina_pesada','modelo' => '120B',            'fabricante' => 'Caterpillar',   'ano' => 1979, 'placa_serie' => '64007439', 'horimetro_atual' => 18650, 'hodometro_atual' => 0,      'status' => 'ativo'],
            ['nome' => 'GPL-0017 — HUBERWACO 140S PATROL',             'tipo' => 'maquina_pesada','modelo' => '140S',            'fabricante' => 'Huberwaco',     'ano' => 1982, 'placa_serie' => '140A2383', 'horimetro_atual' => 22100, 'hodometro_atual' => 0,      'status' => 'em_manutencao'],
            ['nome' => 'GPL-0018 — CASE RETROESCAVADEIRA 580M',        'tipo' => 'maquina_pesada','modelo' => '580M',            'fabricante' => 'Case',          'ano' => 2010, 'placa_serie' => 'NAAH23022', 'horimetro_atual' => 7320, 'hodometro_atual' => 0,      'status' => 'ativo'],
            ['nome' => 'GPL-0019 — NEW HOLLAND RETROESCAVADEIRA B110B','tipo' => 'maquina_pesada','modelo' => 'B110B 4x4',       'fabricante' => 'New Holland',   'ano' => 2011, 'placa_serie' => 'HBZN110BLBAH02722','horimetro_atual'=> 6890,'hodometro_atual'=> 0, 'status' => 'ativo'],
            ['nome' => 'GPL-0020 — VW/NOVA SAVEIRO RB MBVS',           'tipo' => 'veiculo_leve','modelo' => 'Nova Saveiro RB MBVS','fabricante' => 'Volkswagen', 'ano' => 2021, 'placa_serie' => 'RCL-6D62', 'horimetro_atual' => 0,     'hodometro_atual' => 28700,  'status' => 'ativo'],
            ['nome' => 'GPL-0022 — TEMA TERRA ROLO CHAPA',             'tipo' => 'maquina_pesada','modelo' => 'ROLO CHAPA MD TH10','fabricante' => 'Tema Terra',  'ano' => null, 'placa_serie' => 'GPL-0022', 'horimetro_atual' => 3840,  'hodometro_atual' => 0,      'status' => 'ativo'],
            ['nome' => 'GPL-0023 — VOLVO ROLO COMPACTADOR SD105',      'tipo' => 'maquina_pesada','modelo' => 'SD105',           'fabricante' => 'Volvo',         'ano' => 2014, 'placa_serie' => 'VCE0S105AE0707108','horimetro_atual'=> 2760,'hodometro_atual'=> 0,   'status' => 'ativo'],
            ['nome' => 'GPL-0025 — VW/10.160 DRC 4X2',                 'tipo' => 'caminhao',    'modelo' => '10.160 DRC 4X2',    'fabricante' => 'Volkswagen',    'ano' => 2016, 'placa_serie' => 'IXR-7F96', 'horimetro_atual' => 0,     'hodometro_atual' => 54700,  'status' => 'ativo'],
            ['nome' => 'GPL-0038 — VW/31.320 CNC 6X4 CAÇAMBA',        'tipo' => 'caminhao',    'modelo' => '31.320 CNC 6X4',    'fabricante' => 'Volkswagen',    'ano' => 2011, 'placa_serie' => 'KVL-7202', 'horimetro_atual' => 0,     'hodometro_atual' => 98400,  'status' => 'ativo'],
            ['nome' => 'GPL-0039 — VW/24.260 CRM 6X2 CAÇAMBA',        'tipo' => 'caminhao',    'modelo' => '24.260 CRM 6X2',    'fabricante' => 'Volkswagen',    'ano' => 2021, 'placa_serie' => 'EIR-9F77', 'horimetro_atual' => 0,     'hodometro_atual' => 31200,  'status' => 'ativo'],
        ];

        foreach ($frota as $eq) {
            Equipamento::updateOrCreate(['placa_serie' => $eq['placa_serie']], $eq);
        }
    }

    // ── Estoque ───────────────────────────────────────────────────────────
    private function seedEstoque(): void
    {
        $itens = [
            ['codigo' => 'PC-001', 'nome' => 'Filtro de Óleo Motor (caminhão)',    'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 10],
            ['codigo' => 'PC-002', 'nome' => 'Filtro de Ar Primário',              'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 8],
            ['codigo' => 'PC-003', 'nome' => 'Filtro de Ar Secundário',            'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 6],
            ['codigo' => 'PC-004', 'nome' => 'Filtro de Combustível Diesel',       'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 10],
            ['codigo' => 'PC-005', 'nome' => 'Filtro Separador de Água',           'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 6],
            ['codigo' => 'PC-006', 'nome' => 'Filtro Hidráulico Retroescavadeira', 'tipo' => 'filtro', 'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'PC-007', 'nome' => 'Pastilha de Freio Dianteira',        'tipo' => 'peca',   'unidade' => 'jg', 'estoque_minimo' => 4],
            ['codigo' => 'PC-008', 'nome' => 'Lona de Freio Traseira',             'tipo' => 'peca',   'unidade' => 'jg', 'estoque_minimo' => 4],
            ['codigo' => 'PC-009', 'nome' => 'Correia Dentada',                    'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 3],
            ['codigo' => 'PC-010', 'nome' => 'Correia do Alternador',              'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'PC-012', 'nome' => 'Bateria 150Ah (caminhão)',           'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 2],
            ['codigo' => 'OL-001', 'nome' => 'Óleo Motor 15W40 (Diesel) — tambor','tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 50],
            ['codigo' => 'OL-002', 'nome' => 'Óleo Motor 5W30 (Flex) — balde 5L', 'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 20],
            ['codigo' => 'OL-004', 'nome' => 'Óleo Hidráulico HV68',              'tipo' => 'oleo',   'unidade' => 'L',  'estoque_minimo' => 40],
            ['codigo' => 'OL-005', 'nome' => 'Graxa Multiuso (kg)',               'tipo' => 'oleo',   'unidade' => 'kg', 'estoque_minimo' => 10],
            ['codigo' => 'OT-005', 'nome' => 'Pneu Borrachudo 275/80 R22.5',     'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
            ['codigo' => 'OT-006', 'nome' => 'Pneu 295/80 R22.5',               'tipo' => 'peca',   'unidade' => 'un', 'estoque_minimo' => 4],
        ];

        foreach ($itens as $item) {
            ItemEstoque::updateOrCreate(['codigo' => $item['codigo']], $item);
        }
    }

    // ── Planos de Manutenção ──────────────────────────────────────────────
    private function seedPlanosManutencao(): void
    {
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

        $case = Equipamento::where('placa_serie', 'NAAH23022')->first();
        if ($case) {
            $plano = PlanoManutencao::updateOrCreate(
                ['equipamento_id' => $case->id, 'nome' => 'Preventiva 200h — Retroescavadeira 580M'],
                ['descricao' => 'Revisão preventiva a cada 200 horas.', 'ativo' => true]
            );
            GatilhoPlano::updateOrCreate(
                ['plano_id' => $plano->id, 'tipo' => 'horas'],
                ['valor_intervalo' => 200, 'ultimo_valor_executado' => 7200, 'antecedencia_alerta' => 15]
            );
        }

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

    // ── Instruções de Trabalho ────────────────────────────────────────────
    private function seedInstrucoesTrabalho(): void
    {
        $it1 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Troca de Óleo — Caminhão Diesel'],
            ['descricao' => 'Procedimento padrão de troca de óleo para caminhões diesel.', 'tipo' => 'preventiva', 'prioridade' => 'media', 'responsavel' => 'mecanico', 'status' => 'publicada']
        );
        $passos = [
            [1, 'Preparação e EPI', 'Calçar o veículo, acionar freio de estacionamento. Usar luvas e óculos.', 'Nunca trabalhar sob veículo sem calços.'],
            [2, 'Aquecer o motor', 'Ligar o motor por 5 minutos para aquecer o óleo.', null],
            [3, 'Drenar o óleo usado', 'Posicionar bandeja coletora. Remover bujão e aguardar escoamento.', null],
            [4, 'Substituir filtro de óleo', 'Remover filtro antigo. Lubrificar borracha do novo e instalar.', null],
            [5, 'Reapertar bujão de dreno', 'Instalar nova arruela de cobre e apertar conforme torque (30-40 Nm).', null],
            [6, 'Abastecer com óleo novo', 'Preencher com 15W40 diesel. Verificar nível na vareta.', null],
            [7, 'Teste e verificação', 'Ligar o motor, verificar vazamentos na tampa e no filtro.', null],
            [8, 'Registrar no sistema', 'Anotar hodômetro, data, quantidade e tipo de óleo na OS.', null],
        ];
        foreach ($passos as [$ordem, $titulo, $desc, $alerta]) {
            PassoIt::updateOrCreate(['instrucao_trabalho_id' => $it1->id, 'ordem' => $ordem],
                ['instrucao_trabalho_id' => $it1->id, 'ordem' => $ordem, 'titulo' => $titulo, 'descricao' => $desc, 'alerta_seguranca' => $alerta]);
        }

        $it2 = InstrucaoTrabalho::updateOrCreate(
            ['titulo' => 'Inspeção do Sistema Hidráulico — Retroescavadeira'],
            ['descricao' => 'Inspeção periódica do sistema hidráulico.', 'tipo' => 'preditiva', 'prioridade' => 'alta', 'responsavel' => 'mecanico', 'status' => 'publicada']
        );
        $passos2 = [
            [1, 'Verificar nível do fluido hidráulico', 'Com a máquina nivelada, verificar nível no visor do reservatório.', null],
            [2, 'Inspecionar mangueiras e conexões', 'Verificar todas as mangueiras quanto a vazamentos e desgaste.', null],
            [3, 'Verificar cilindros hidráulicos', 'Inspecionar haste dos cilindros quanto a riscos e vazamento.', 'Nunca trabalhar com concha suspensa sem suporte.'],
            [4, 'Substituir filtro hidráulico', 'A cada 500h substituir o filtro retorno do reservatório.', null],
            [5, 'Testar pressão do sistema', 'Verificar pressão de trabalho conforme especificação (200-250 bar).', null],
            [6, 'Verificar temperatura', 'Operar 10 minutos e verificar temperatura do fluido (máx. 80°C).', null],
        ];
        foreach ($passos2 as [$ordem, $titulo, $desc, $alerta]) {
            PassoIt::updateOrCreate(['instrucao_trabalho_id' => $it2->id, 'ordem' => $ordem],
                ['instrucao_trabalho_id' => $it2->id, 'ordem' => $ordem, 'titulo' => $titulo, 'descricao' => $desc, 'alerta_seguranca' => $alerta]);
        }
    }

    // ── Checklists ────────────────────────────────────────────────────────
    private function seedChecklists(): void
    {
        $modelo1 = ModeloChecklist::updateOrCreate(
            ['nome' => 'Checklist Pré-Operacional — Caminhão'],
            ['tipo_equipamento' => 'caminhao', 'periodicidade' => 'diario', 'ativo' => true]
        );
        $itens1 = [
            ['Nível de óleo do motor', 'ok_nok', true, 1], ['Nível de água do radiador', 'ok_nok', true, 2],
            ['Nível de fluido de freio', 'ok_nok', true, 3], ['Pressão dos pneus (visual)', 'ok_nok', true, 4],
            ['Funcionamento das luzes', 'ok_nok', false, 5], ['Extintor de incêndio presente', 'ok_nok', true, 6],
            ['Freio de estacionamento funcionando', 'ok_nok', true, 7],
            ['Hodômetro atual (km)', 'valor_numerico', false, 8], ['Observações do motorista', 'texto', false, 9],
        ];
        foreach ($itens1 as [$desc, $tipo, $critico, $ordem]) {
            ItemChecklist::updateOrCreate(
                ['modelo_id' => $modelo1->id, 'descricao' => $desc],
                ['modelo_id' => $modelo1->id, 'descricao' => $desc, 'tipo_resposta' => $tipo, 'critico' => $critico, 'ordem' => $ordem]
            );
        }

        $modelo2 = ModeloChecklist::updateOrCreate(
            ['nome' => 'Checklist Pré-Operacional — Máquina Pesada'],
            ['tipo_equipamento' => 'maquina_pesada', 'periodicidade' => 'diario', 'ativo' => true]
        );
        $itens2 = [
            ['Nível de óleo do motor', 'ok_nok', true, 1], ['Nível do fluido hidráulico', 'ok_nok', true, 2],
            ['Nível de água do radiador', 'ok_nok', true, 3], ['Mangueiras hidráulicas sem vazamento', 'ok_nok', true, 4],
            ['Estado das esteiras / pneus', 'ok_nok', true, 5], ['Funcionamento das luzes de trabalho', 'ok_nok', false, 6],
            ['Buzina e alarme de ré funcionando', 'ok_nok', true, 7], ['Extintor de incêndio presente', 'ok_nok', true, 8],
            ['Horímetro atual (horas)', 'valor_numerico', false, 9], ['Observações do operador', 'texto', false, 10],
        ];
        foreach ($itens2 as [$desc, $tipo, $critico, $ordem]) {
            ItemChecklist::updateOrCreate(
                ['modelo_id' => $modelo2->id, 'descricao' => $desc],
                ['modelo_id' => $modelo2->id, 'descricao' => $desc, 'tipo_resposta' => $tipo, 'critico' => $critico, 'ordem' => $ordem]
            );
        }
    }

    // ── Programações Semanais (PCP) ────────────────────────────────────────
    private function seedProgramacoes(): void
    {
        $c1 = Contrato::where('numero', 'DER-2024-001')->first(); // conserva SP-310
        $c2 = Contrato::where('numero', 'DER-2024-002')->first(); // conserva SP-461
        $c3 = Contrato::where('numero', 'PREF-2024-003')->first(); // terraplenagem
        $c4 = Contrato::where('numero', 'DER-2024-004')->first(); // pavimentação SP-595
        if (!$c1 || !$c2 || !$c3 || !$c4) return;

        $equipeA = EquipeCampo::where('nome', 'Equipe A — Conserva DER')->first();
        $equipeB = EquipeCampo::where('nome', 'Equipe B — Terraplenagem')->first();
        $equipeC = EquipeCampo::where('nome', 'Equipe C — Drenagem e Obras')->first();
        $equipeD = EquipeCampo::where('nome', 'Equipe D — SP-461 Conserva')->first();

        $ativ = fn (string $codigo) => Atividade::where('codigo', $codigo)->first()?->id;
        $pcp = \App\Models\User::where('email', 'pcp@primus.com')->first();

        $seg = '2026-06-29';
        $ter = '2026-06-30';
        $qua = '2026-07-01';
        $qui = '2026-07-02';
        $sex = '2026-07-03';

        $programacoes = [
            // Equipe A — pavimentação SP-595 (DER-2024-004)
            ['contrato' => $c4, 'equipe' => $equipeA, 'data' => $seg, 'status' => 'executado', 'itens' => [
                ['atividade' => 'AT-005', 'prevista' => 8000, 'executada' => 8000, 'unidade' => 'm²'],
            ]],
            ['contrato' => $c4, 'equipe' => $equipeA, 'data' => $ter, 'status' => 'em_execucao', 'itens' => [
                ['atividade' => 'AT-003', 'prevista' => 620, 'executada' => 300, 'unidade' => 'm²'],
            ]],
            ['contrato' => $c4, 'equipe' => $equipeA, 'data' => $qua, 'status' => 'planejado', 'itens' => [
                ['atividade' => 'AT-003', 'prevista' => 480, 'executada' => 0, 'unidade' => 'm²'],
            ]],
            // Equipe C — drenagem, contrato DER-2024-001
            ['contrato' => $c1, 'equipe' => $equipeC, 'data' => $seg, 'status' => 'executado', 'itens' => [
                ['atividade' => 'AT-007', 'prevista' => 18, 'executada' => 18, 'unidade' => 'un'],
            ]],
            ['contrato' => $c1, 'equipe' => $equipeC, 'data' => $qua, 'status' => 'aprovado', 'itens' => [
                ['atividade' => 'AT-008', 'prevista' => 4200, 'executada' => 0, 'unidade' => 'm'],
            ]],
            // Equipe D — conserva SP-461 (DER-2024-002)
            ['contrato' => $c2, 'equipe' => $equipeD, 'data' => $seg, 'status' => 'executado', 'itens' => [
                ['atividade' => 'AT-011', 'prevista' => 62000, 'executada' => 62000, 'unidade' => 'm²'],
            ]],
            ['contrato' => $c2, 'equipe' => $equipeD, 'data' => $qua, 'status' => 'parcialmente_executado', 'itens' => [
                ['atividade' => 'AT-001', 'prevista' => 380, 'executada' => 210, 'unidade' => 'm²'],
            ]],
            ['contrato' => $c2, 'equipe' => $equipeD, 'data' => $sex, 'status' => 'planejado', 'itens' => [
                ['atividade' => 'AT-008', 'prevista' => 4200, 'executada' => 0, 'unidade' => 'm'],
            ]],
            // Equipe B — terraplenagem (PREF-2024-003)
            ['contrato' => $c3, 'equipe' => $equipeB, 'data' => $seg, 'status' => 'executado', 'itens' => [
                ['atividade' => 'AT-013', 'prevista' => 1800, 'executada' => 1800, 'unidade' => 'm³'],
            ]],
            ['contrato' => $c3, 'equipe' => $equipeB, 'data' => $ter, 'status' => 'em_execucao', 'itens' => [
                ['atividade' => 'AT-014', 'prevista' => 1200, 'executada' => 600, 'unidade' => 'm³'],
            ]],
            ['contrato' => $c3, 'equipe' => $equipeB, 'data' => $qui, 'status' => 'planejado', 'itens' => [
                ['atividade' => 'AT-016', 'prevista' => 300, 'executada' => 0, 'unidade' => 'm³'],
            ]],
        ];

        foreach ($programacoes as $p) {
            $programacao = Programacao::updateOrCreate(
                ['contrato_id' => $p['contrato']->id, 'equipe_id' => $p['equipe']?->id, 'data_programada' => $p['data']],
                [
                    'contrato_id'     => $p['contrato']->id,
                    'equipe_id'       => $p['equipe']?->id,
                    'lider_id'        => $p['equipe']?->lider_id,
                    'data_programada' => $p['data'],
                    'tipo'            => 'diario',
                    'turno'           => 'integral',
                    'status'          => $p['status'],
                    'criado_por'      => $pcp?->id,
                ]
            );
            foreach ($p['itens'] as $item) {
                ProgramacaoItem::updateOrCreate(
                    ['programacao_id' => $programacao->id, 'atividade_id' => $ativ($item['atividade'])],
                    [
                        'programacao_id'       => $programacao->id,
                        'atividade_id'         => $ativ($item['atividade']),
                        'quantidade_prevista'  => $item['prevista'],
                        'quantidade_executada' => $item['executada'],
                        'unidade'              => $item['unidade'],
                    ]
                );
            }
        }
    }

    // ── Apontamentos de Produção ────────────────────────────────────────────
    private function seedApontamentos(): void
    {
        $c1 = Contrato::where('numero', 'DER-2024-001')->first();
        $c2 = Contrato::where('numero', 'DER-2024-002')->first();
        $c3 = Contrato::where('numero', 'PREF-2024-003')->first();
        $c4 = Contrato::where('numero', 'DER-2024-004')->first();
        if (!$c1 || !$c2 || !$c3 || !$c4) return;

        $equipeA = EquipeCampo::where('nome', 'Equipe A — Conserva DER')->first();
        $equipeB = EquipeCampo::where('nome', 'Equipe B — Terraplenagem')->first();
        $equipeD = EquipeCampo::where('nome', 'Equipe D — SP-461 Conserva')->first();

        $ativ = fn (string $codigo) => Atividade::where('codigo', $codigo)->first()?->id;
        $trecho1 = Trecho::where('descricao', 'SP-310 — Km 418 a Km 432')->first();

        $lider = \App\Models\User::where('email', 'lider@primus.com')->first();
        $pcp = \App\Models\User::where('email', 'pcp@primus.com')->first();

        $apontamentos = [
            [
                'codigo' => 'AP-2026-0001', 'contrato' => $c4, 'equipe' => $equipeA, 'atividade' => 'AT-005',
                'data' => '2026-06-29', 'turno' => 'manha', 'quantidade' => 8000, 'unidade' => 'm²',
                'status' => 'validado', 'responsavel' => $lider, 'validador' => $pcp,
            ],
            [
                'codigo' => 'AP-2026-0002', 'contrato' => $c1, 'equipe' => $equipeA, 'atividade' => 'AT-006',
                'trecho' => $trecho1, 'data' => '2026-06-30', 'turno' => 'tarde', 'quantidade' => 520, 'unidade' => 'm²',
                'status' => 'enviado', 'responsavel' => $lider,
            ],
            [
                'codigo' => 'AP-2026-0003', 'contrato' => $c2, 'equipe' => $equipeD, 'atividade' => 'AT-011',
                'data' => '2026-06-29', 'turno' => 'manha', 'quantidade' => 62000, 'unidade' => 'm²',
                'status' => 'validado', 'responsavel' => $lider, 'validador' => $pcp,
            ],
            [
                'codigo' => 'AP-2026-0004', 'contrato' => $c2, 'equipe' => $equipeD, 'atividade' => 'AT-001',
                'data' => '2026-07-01', 'turno' => 'tarde', 'quantidade' => 210, 'unidade' => 'm²',
                'status' => 'rascunho', 'responsavel' => $lider,
            ],
            [
                'codigo' => 'AP-2026-0005', 'contrato' => $c3, 'equipe' => $equipeB, 'atividade' => 'AT-013',
                'data' => '2026-06-29', 'turno' => 'integral', 'quantidade' => 1800, 'unidade' => 'm³',
                'status' => 'validado', 'responsavel' => $lider, 'validador' => $pcp,
            ],
            [
                'codigo' => 'AP-2026-0006', 'contrato' => $c3, 'equipe' => $equipeB, 'atividade' => 'AT-014',
                'data' => '2026-06-30', 'turno' => 'integral', 'quantidade' => 600, 'unidade' => 'm³',
                'status' => 'rejeitado', 'responsavel' => $lider, 'motivo_rejeicao' => 'Quantidade divergente da medição em campo.',
            ],
        ];

        foreach ($apontamentos as $a) {
            ApontamentoProducao::updateOrCreate(
                ['codigo' => $a['codigo']],
                [
                    'contrato_id'          => $a['contrato']->id,
                    'equipe_id'            => $a['equipe']?->id,
                    'atividade_id'         => $ativ($a['atividade']),
                    'trecho_id'            => ($a['trecho'] ?? null)?->id,
                    'data'                 => $a['data'],
                    'turno'                => $a['turno'],
                    'quantidade_executada' => $a['quantidade'],
                    'unidade'              => $a['unidade'],
                    'status'               => $a['status'],
                    'responsavel_id'       => $a['responsavel']?->id,
                    'validado_por'         => ($a['validador'] ?? null)?->id,
                    'validado_em'          => isset($a['validador']) ? now() : null,
                    'motivo_rejeicao'      => $a['motivo_rejeicao'] ?? null,
                ]
            );
        }
    }

    // ── Horas de Equipamento ─────────────────────────────────────────────────
    private function seedHorasEquipamento(): void
    {
        $c1 = Contrato::where('numero', 'DER-2024-001')->first();
        $c3 = Contrato::where('numero', 'PREF-2024-003')->first();
        $c4 = Contrato::where('numero', 'DER-2024-004')->first();

        $escavadeira = Equipamento::where('placa_serie', 'KMTPC180K51B30461')->first();
        $retro       = Equipamento::where('placa_serie', 'NAAH23022')->first();
        $patrol      = Equipamento::where('placa_serie', '64007439')->first();
        $caminhao    = Equipamento::where('placa_serie', 'HMG-6I78')->first();

        $opValdemir  = Colaborador::where('matricula', 'F-011')->first();
        $opWaldemiro = Colaborador::where('matricula', 'F-012')->first();
        $opEdson     = Colaborador::where('matricula', 'F-013')->first();
        $motPaulo    = Colaborador::where('matricula', 'F-020')->first();

        $mpChuva     = MotivoParada::where('codigo', 'MP-CHUVA')->first();
        $registrador = \App\Models\User::where('email', 'lider@primus.com')->first();

        $registros = [
            [
                'codigo' => 'HE-2026-0001', 'equipamento' => $escavadeira, 'contrato' => $c3, 'operador' => $opValdemir,
                'data' => '2026-06-29', 'hora_inicio' => '07:00', 'hora_fim' => '17:00',
                'horimetro_inicial' => 9000, 'horimetro_final' => 9009,
                'horas_produtivas' => 8, 'horas_improdutivas' => 1, 'horas_paradas' => 0,
                'status' => 'validado',
            ],
            [
                'codigo' => 'HE-2026-0002', 'equipamento' => $retro, 'contrato' => $c1, 'operador' => $opWaldemiro,
                'data' => '2026-06-29', 'hora_inicio' => '07:00', 'hora_fim' => '16:00',
                'horimetro_inicial' => 7200, 'horimetro_final' => 7207,
                'horas_produtivas' => 6, 'horas_improdutivas' => 1, 'horas_paradas' => 2,
                'motivo_parada' => $mpChuva, 'status' => 'validado',
            ],
            [
                'codigo' => 'HE-2026-0003', 'equipamento' => $patrol, 'contrato' => $c4, 'operador' => $opEdson,
                'data' => '2026-06-30', 'hora_inicio' => '07:00', 'hora_fim' => '17:00',
                'horimetro_inicial' => 18650, 'horimetro_final' => 18658,
                'horas_produtivas' => 8, 'horas_improdutivas' => 2, 'horas_paradas' => 0,
                'status' => 'enviado',
            ],
            [
                'codigo' => 'HE-2026-0004', 'equipamento' => $caminhao, 'contrato' => $c4, 'operador' => $motPaulo,
                'data' => '2026-06-30', 'hora_inicio' => '06:30', 'hora_fim' => '15:30',
                'hodometro_inicial' => 148300, 'hodometro_final' => 148420,
                'horas_produtivas' => 7, 'horas_improdutivas' => 1, 'horas_paradas' => 1,
                'motivo_parada' => $mpChuva, 'status' => 'rascunho',
            ],
        ];

        foreach ($registros as $r) {
            if (!$r['equipamento']) continue;
            HorasEquipamento::updateOrCreate(
                ['codigo' => $r['codigo']],
                [
                    'equipamento_id'     => $r['equipamento']->id,
                    'contrato_id'        => $r['contrato']?->id,
                    'operador_id'        => $r['operador']?->id,
                    'data'               => $r['data'],
                    'hora_inicio'        => $r['hora_inicio'],
                    'hora_fim'           => $r['hora_fim'],
                    'horimetro_inicial'  => $r['horimetro_inicial'] ?? null,
                    'horimetro_final'    => $r['horimetro_final'] ?? null,
                    'hodometro_inicial'  => $r['hodometro_inicial'] ?? null,
                    'hodometro_final'    => $r['hodometro_final'] ?? null,
                    'horas_produtivas'   => $r['horas_produtivas'],
                    'horas_improdutivas' => $r['horas_improdutivas'],
                    'horas_paradas'      => $r['horas_paradas'],
                    'motivo_parada_id'   => ($r['motivo_parada'] ?? null)?->id,
                    'status'             => $r['status'],
                    'registrado_por'     => $registrador?->id,
                ]
            );
        }
    }
}
