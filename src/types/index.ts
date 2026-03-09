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
  numero: number;
  data: string;
  origem: string;
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
  dificuldadePercebida: string;
  dificuldadesEncontradas: string;
  correcaoLacunas: boolean;
}

export interface ProvaEnem {
  id: string;
  alunoId: string;
  ano: number;
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
  dificuldadePercebida: string;
  dificuldadesEncontradas: string;
  correcaoLacunas: boolean;
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

export interface MentorObservacao {
  id: string;
  alunoId: string;
  texto: string;
  data: string;
}

export interface CheckpointSemanal {
  id: string;
  alunoId: string;
  data: string;
  foco: string;
  dificuldades: string;
  tarefas: string;
}

export interface Duvida {
  id: string;
  alunoId: string;
  nomeAluno: string;
  titulo: string;
  disciplina: string;
  texto: string;
  status: 'pendente' | 'respondida';
  resposta?: string;
  createdAt: string;
  respondedAt?: string;
}
