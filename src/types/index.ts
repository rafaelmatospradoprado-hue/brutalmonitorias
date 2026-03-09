export interface Student {
  id: string;
  nome: string;
  objetivo: string;
  acertosIniciais: number;
  acertosAtuais: number;
  meta: number;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  nome: string;
  area: 'Linguagens' | 'Humanas' | 'Natureza' | 'Matemática';
  incidencia: 'obrigatório' | 'alta' | 'média' | 'baixa';
  teoria: boolean;
  pratica: boolean;
  dominio: boolean;
  alunoId: string;
}

export interface Simulado {
  id: string;
  alunoId: string;
  data: string;
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
}

export interface ProvaEnem {
  id: string;
  alunoId: string;
  ano: number;
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
}

export interface PlanejamentoSemanal {
  id: string;
  alunoId: string;
  semana: number;
  conteudos: string;
  listas: string;
  simulados: string;
  observacoes: string;
}
