import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Student, ContentItem, Simulado, ProvaEnem, PlanejamentoSemanal, MentorObservacao, CheckpointSemanal, Duvida } from '@/types';
import { contentTemplate } from '@/data/contentTemplate';

const sb = supabase as any;

// ---- Mappers (DB snake_case -> App camelCase) ----

function mapStudent(r: any): Student {
  return { id: r.id, nome: r.nome, objetivo: r.objetivo, acertosIniciais: r.acertos_iniciais, acertosAtuais: r.acertos_atuais, meta: r.meta, createdAt: r.created_at };
}

function mapContent(r: any): ContentItem {
  return { id: r.id, nome: r.nome, area: r.area, incidencia: r.incidencia, teoria: r.teoria, pratica: r.pratica, dominio: r.dominio, alunoId: r.aluno_id };
}

function mapSimulado(r: any): Simulado {
  return {
    id: r.id, alunoId: r.aluno_id, numero: r.numero, data: r.data, origem: r.origem,
    linguagens: r.linguagens, humanas: r.humanas, natureza: r.natureza, matematica: r.matematica,
    dificuldadePercebida: r.dificuldade_percebida, dificuldadesEncontradas: r.dificuldades_encontradas,
    correcaoLacunas: r.correcao_lacunas,
    erroLacunaConteudo: r.erro_lacuna_conteudo, erroDesatencao: r.erro_desatencao,
    erroBanal: r.erro_banal, erroConteudoNaoEstudado: r.erro_conteudo_nao_estudado,
    conteudosComLacuna: r.conteudos_com_lacuna, questoesAjuda: r.questoes_ajuda,
    questoesAjudaImagem: r.questoes_ajuda_imagem, acertosPosRevisao: r.acertos_pos_revisao,
  };
}

function mapProvaEnem(r: any): ProvaEnem {
  return {
    id: r.id, alunoId: r.aluno_id, ano: r.ano,
    linguagens: r.linguagens, humanas: r.humanas, natureza: r.natureza, matematica: r.matematica,
    dificuldadePercebida: r.dificuldade_percebida, dificuldadesEncontradas: r.dificuldades_encontradas,
    correcaoLacunas: r.correcao_lacunas,
    erroLacunaConteudo: r.erro_lacuna_conteudo, erroDesatencao: r.erro_desatencao,
    erroBanal: r.erro_banal, erroConteudoNaoEstudado: r.erro_conteudo_nao_estudado,
    conteudosComLacuna: r.conteudos_com_lacuna, questoesAjuda: r.questoes_ajuda,
    questoesAjudaImagem: r.questoes_ajuda_imagem, acertosPosRevisao: r.acertos_pos_revisao,
  };
}

function mapPlanejamento(r: any): PlanejamentoSemanal {
  return { id: r.id, alunoId: r.aluno_id, semana: r.semana, conteudos: r.conteudos, listas: r.listas, simulados: r.simulados_text, observacoes: r.observacoes };
}

function mapObservacao(r: any): MentorObservacao {
  return { id: r.id, alunoId: r.aluno_id, texto: r.texto, data: r.data };
}

function mapCheckpoint(r: any): CheckpointSemanal {
  return { id: r.id, alunoId: r.aluno_id, data: r.data, foco: r.foco, dificuldades: r.dificuldades, tarefas: r.tarefas };
}

function mapDuvida(r: any): Duvida {
  return {
    id: r.id, alunoId: r.aluno_id, nomeAluno: r.nome_aluno, titulo: r.titulo,
    disciplina: r.disciplina, texto: r.texto, imagemUrl: r.imagem_url,
    status: r.status, resposta: r.resposta, respostaImagemUrl: r.resposta_imagem_url,
    createdAt: r.created_at, respondedAt: r.responded_at,
  };
}

// ---- Hooks ----

export function useStudents() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await sb.from('students').select('*').order('created_at');
      return (data || []).map(mapStudent) as Student[];
    },
  });

  const addStudent = async (s: Omit<Student, 'id' | 'createdAt'>): Promise<Student | null> => {
    const { data } = await sb.from('students').insert({
      nome: s.nome, objetivo: s.objetivo,
      acertos_iniciais: s.acertosIniciais, acertos_atuais: s.acertosAtuais, meta: s.meta,
    }).select().single();
    await qc.invalidateQueries({ queryKey: ['students'] });
    return data ? mapStudent(data) : null;
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const db: any = {};
    if (updates.nome !== undefined) db.nome = updates.nome;
    if (updates.objetivo !== undefined) db.objetivo = updates.objetivo;
    if (updates.acertosIniciais !== undefined) db.acertos_iniciais = updates.acertosIniciais;
    if (updates.acertosAtuais !== undefined) db.acertos_atuais = updates.acertosAtuais;
    if (updates.meta !== undefined) db.meta = updates.meta;
    await sb.from('students').update(db).eq('id', id);
    await qc.invalidateQueries({ queryKey: ['students'] });
  };

  return { students: q.data ?? [], loading: q.isLoading, addStudent, updateStudent, refetch: q.refetch };
}

export function useContents(alunoId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['contents', alunoId ?? 'all'],
    queryFn: async () => {
      let query = sb.from('contents').select('*');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data } = await query;
      return (data || []).map(mapContent) as ContentItem[];
    },
  });

  const initContentForStudent = async (studentId: string) => {
    const { count } = await sb.from('contents').select('*', { count: 'exact', head: true }).eq('aluno_id', studentId);
    if ((count ?? 0) === 0) {
      const items = contentTemplate.map((t: any) => ({
        aluno_id: studentId, nome: t.nome, area: t.area, incidencia: t.incidencia,
        teoria: false, pratica: false, dominio: false,
      }));
      await sb.from('contents').insert(items);
      await qc.invalidateQueries({ queryKey: ['contents'] });
    }
  };

  const toggleContent = async (id: string, field: 'teoria' | 'pratica' | 'dominio') => {
    const item = (q.data ?? []).find((c: ContentItem) => c.id === id);
    if (!item) return;
    await sb.from('contents').update({ [field]: !item[field] }).eq('id', id);
    await qc.invalidateQueries({ queryKey: ['contents'] });
  };

  return { contents: q.data ?? [], loading: q.isLoading, initContentForStudent, toggleContent, refetch: q.refetch };
}

export function useSimulados(alunoId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['simulados', alunoId ?? 'all'],
    queryFn: async () => {
      let query = sb.from('simulados').select('*');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data } = await query;
      return (data || []).map(mapSimulado) as Simulado[];
    },
  });

  const addSimulado = async (s: Omit<Simulado, 'id'>) => {
    const { data } = await sb.from('simulados').insert({
      aluno_id: s.alunoId, numero: s.numero, data: s.data, origem: s.origem,
      linguagens: s.linguagens, humanas: s.humanas, natureza: s.natureza, matematica: s.matematica,
      dificuldade_percebida: s.dificuldadePercebida, dificuldades_encontradas: s.dificuldadesEncontradas,
      correcao_lacunas: s.correcaoLacunas,
      erro_lacuna_conteudo: s.erroLacunaConteudo, erro_desatencao: s.erroDesatencao,
      erro_banal: s.erroBanal, erro_conteudo_nao_estudado: s.erroConteudoNaoEstudado,
      conteudos_com_lacuna: s.conteudosComLacuna, questoes_ajuda: s.questoesAjuda,
      questoes_ajuda_imagem: s.questoesAjudaImagem,
    }).select().single();
    await qc.invalidateQueries({ queryKey: ['simulados'] });
    return data ? mapSimulado(data) : null;
  };

  const updateSimulado = async (id: string, updates: Partial<Simulado>) => {
    const db: any = {};
    if (updates.acertosPosRevisao !== undefined) db.acertos_pos_revisao = updates.acertosPosRevisao;
    if (updates.linguagens !== undefined) db.linguagens = updates.linguagens;
    if (updates.humanas !== undefined) db.humanas = updates.humanas;
    if (updates.natureza !== undefined) db.natureza = updates.natureza;
    if (updates.matematica !== undefined) db.matematica = updates.matematica;
    if (updates.correcaoLacunas !== undefined) db.correcao_lacunas = updates.correcaoLacunas;
    await sb.from('simulados').update(db).eq('id', id);
    await qc.invalidateQueries({ queryKey: ['simulados'] });
  };

  return { simulados: q.data ?? [], loading: q.isLoading, addSimulado, updateSimulado, refetch: q.refetch };
}

export function useProvasEnem(alunoId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['provas_enem', alunoId ?? 'all'],
    queryFn: async () => {
      let query = sb.from('provas_enem').select('*');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data } = await query;
      return (data || []).map(mapProvaEnem) as ProvaEnem[];
    },
  });

  const addProvaEnem = async (s: Omit<ProvaEnem, 'id'>) => {
    const { data } = await sb.from('provas_enem').insert({
      aluno_id: s.alunoId, ano: s.ano,
      linguagens: s.linguagens, humanas: s.humanas, natureza: s.natureza, matematica: s.matematica,
      dificuldade_percebida: s.dificuldadePercebida, dificuldades_encontradas: s.dificuldadesEncontradas,
      correcao_lacunas: s.correcaoLacunas,
      erro_lacuna_conteudo: s.erroLacunaConteudo, erro_desatencao: s.erroDesatencao,
      erro_banal: s.erroBanal, erro_conteudo_nao_estudado: s.erroConteudoNaoEstudado,
      conteudos_com_lacuna: s.conteudosComLacuna, questoes_ajuda: s.questoesAjuda,
      questoes_ajuda_imagem: s.questoesAjudaImagem,
    }).select().single();
    await qc.invalidateQueries({ queryKey: ['provas_enem'] });
    return data ? mapProvaEnem(data) : null;
  };

  const updateProvaEnem = async (id: string, updates: Partial<ProvaEnem>) => {
    const db: any = {};
    if (updates.acertosPosRevisao !== undefined) db.acertos_pos_revisao = updates.acertosPosRevisao;
    await sb.from('provas_enem').update(db).eq('id', id);
    await qc.invalidateQueries({ queryKey: ['provas_enem'] });
  };

  return { provas: q.data ?? [], loading: q.isLoading, addProvaEnem, updateProvaEnem, refetch: q.refetch };
}

export function usePlanejamentos(alunoId: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['planejamentos', alunoId],
    queryFn: async () => {
      const { data } = await sb.from('planejamentos').select('*').eq('aluno_id', alunoId).order('semana');
      return (data || []).map(mapPlanejamento) as PlanejamentoSemanal[];
    },
  });

  const savePlanejamento = async (p: PlanejamentoSemanal) => {
    await sb.from('planejamentos').upsert({
      aluno_id: p.alunoId, semana: p.semana,
      conteudos: p.conteudos, listas: p.listas, simulados_text: p.simulados, observacoes: p.observacoes,
    }, { onConflict: 'aluno_id,semana' });
    await qc.invalidateQueries({ queryKey: ['planejamentos'] });
  };

  return { planejamentos: q.data ?? [], loading: q.isLoading, savePlanejamento, refetch: q.refetch };
}

export function useMentorObservacoes(alunoId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['mentor_observacoes', alunoId ?? 'all'],
    queryFn: async () => {
      let query = sb.from('mentor_observacoes').select('*').order('data');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data } = await query;
      return (data || []).map(mapObservacao) as MentorObservacao[];
    },
  });

  const addObservacao = async (studentId: string, texto: string) => {
    await sb.from('mentor_observacoes').insert({ aluno_id: studentId, texto });
    await qc.invalidateQueries({ queryKey: ['mentor_observacoes'] });
  };

  return { observacoes: q.data ?? [], loading: q.isLoading, addObservacao, refetch: q.refetch };
}

export function useCheckpoints(alunoId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['checkpoints', alunoId ?? 'all'],
    queryFn: async () => {
      let query = sb.from('checkpoints').select('*').order('data');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data } = await query;
      return (data || []).map(mapCheckpoint) as CheckpointSemanal[];
    },
  });

  const addCheckpoint = async (studentId: string, foco: string, dificuldades: string, tarefas: string) => {
    await sb.from('checkpoints').insert({ aluno_id: studentId, foco, dificuldades, tarefas });
    await qc.invalidateQueries({ queryKey: ['checkpoints'] });
  };

  return { checkpoints: q.data ?? [], loading: q.isLoading, addCheckpoint, refetch: q.refetch };
}

export function useDuvidas(alunoId?: string) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['duvidas', alunoId ?? 'all'],
    queryFn: async () => {
      let query = sb.from('duvidas').select('*').order('created_at');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data } = await query;
      return (data || []).map(mapDuvida) as Duvida[];
    },
  });

  const addDuvida = async (d: Omit<Duvida, 'id' | 'status' | 'createdAt'>) => {
    await sb.from('duvidas').insert({
      aluno_id: d.alunoId, nome_aluno: d.nomeAluno, titulo: d.titulo,
      disciplina: d.disciplina, texto: d.texto, imagem_url: d.imagemUrl,
    });
    await qc.invalidateQueries({ queryKey: ['duvidas'] });
  };

  const responderDuvida = async (id: string, resposta: string, respostaImagemUrl?: string) => {
    await sb.from('duvidas').update({
      resposta, resposta_imagem_url: respostaImagemUrl, status: 'respondida', responded_at: new Date().toISOString(),
    }).eq('id', id);
    await qc.invalidateQueries({ queryKey: ['duvidas'] });
  };

  return { duvidas: q.data ?? [], loading: q.isLoading, addDuvida, responderDuvida, refetch: q.refetch };
}

// Standalone helper for getting a student name by id (used in simulados/provas save)
export async function fetchStudentName(id: string): Promise<string> {
  const { data } = await sb.from('students').select('nome').eq('id', id).single();
  return data?.nome ?? 'Aluno';
}
