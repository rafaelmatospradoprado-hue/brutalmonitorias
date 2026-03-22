export interface Student {
  id: string;
  nome: string;
  objetivo: string;
  acertosIniciais: number;
  acertosAtuais: number;
  meta: number;
  createdAt: string;
  fichaTecnica?: string;
  password?: string;
}

export interface ContentItem {
  id: string;
  nome: string;
  area: 'Linguagens' | 'Humanas' | 'Natureza' | 'Matemática';
  subArea?: 'Biologia' | 'Física' | 'Química';
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
  // Error analysis
  erroLacunaConteudo?: number;
  erroDesatencao?: number;
  erroBanal?: number;
  erroConteudoNaoEstudado?: number;
  // Lacunas
  conteudosComLacuna?: string;
  // Questões para monitoria
  questoesAjuda?: string;
  questoesAjudaImagem?: string;
  // Revision
  acertosPosRevisao?: number;
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
  // Error analysis
  erroLacunaConteudo?: number;
  erroDesatencao?: number;
  erroBanal?: number;
  erroConteudoNaoEstudado?: number;
  // Lacunas
  conteudosComLacuna?: string;
  // Questões para monitoria
  questoesAjuda?: string;
  questoesAjudaImagem?: string;
  // Revision
  acertosPosRevisao?: number;
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
  imagemUrl?: string;
  status: 'pendente' | 'respondida';
  resposta?: string;
  respostaImagemUrl?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface TABQuestion {
  id: number; // 1 to 15
  numeroOriginal: number; // 1 to 180
  status: 'acerto' | 'erro' | 'pendente';
  tipoErro?: 'desatencao' | 'lacuna' | 'desconhecimento';
  // Filtro A (Lacuna)
  gabaritoOk?: boolean;
  escritaOk?: boolean;
  videoOk?: boolean;
  // Filtro B (Desconhecimento)
  estudoOk?: boolean;
  conteudo?: string;
}

export interface TABRecord {
  id: string;
  alunoId: string;
  provaAno: number;
  bloco: number; // 1 to 12
  questoes: TABQuestion[];
  createdAt: string;
}
