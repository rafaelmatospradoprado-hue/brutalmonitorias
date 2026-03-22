import { supabase } from '@/integrations/supabase/client';
import { Student, ContentItem, Simulado, ProvaEnem, PlanejamentoSemanal, MentorObservacao, CheckpointSemanal, Duvida, TABRecord } from '@/types';

// Students
export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(s => ({
    id: s.id,
    nome: s.nome,
    objetivo: s.objetivo,
    acertosIniciais: s.acertos_iniciais,
    acertosAtuais: s.acertos_atuais,
    meta: s.meta,
    createdAt: s.created_at,
    fichaTecnica: s.ficha_tecnica,
    password: s.password
  }));
}

export async function addStudent(s: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
  const { data, error } = await supabase.from('students').insert([{
    nome: s.nome,
    objetivo: s.objetivo,
    acertos_iniciais: s.acertosIniciais,
    acertos_atuais: s.acertosAtuais,
    meta: s.meta,
    ficha_tecnica: s.fichaTecnica,
    password: s.password || 'Dana andar'
  }]).select().single();
  
  if (error) throw error;
  return {
    ...s,
    id: data.id,
    createdAt: data.created_at
  };
}

export async function updateStudent(id: string, data: Partial<Student>) {
  const updateData: any = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.objetivo !== undefined) updateData.objetivo = data.objetivo;
  if (data.acertosIniciais !== undefined) updateData.acertos_iniciais = data.acertosIniciais;
  if (data.acertosAtuais !== undefined) updateData.acertos_atuais = data.acertosAtuais;
  if (data.meta !== undefined) updateData.meta = data.meta;
  if (data.fichaTecnica !== undefined) updateData.ficha_tecnica = data.fichaTecnica;
  if (data.password !== undefined) updateData.password = data.password;

  const { error } = await supabase.from('students').update(updateData).eq('id', id);
  if (error) throw error;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

// Content
export async function getContents(alunoId: string): Promise<ContentItem[]> {
  const { data, error } = await supabase.from('contents').select('*').eq('aluno_id', alunoId);
  if (error) throw error;
  if (!data) return [];
  return data.map(c => ({
    id: c.id,
    nome: c.nome,
    area: c.area as any,
    subArea: c.sub_area as any,
    incidencia: c.incidencia as any,
    teoria: c.teoria,
    pratica: c.pratica,
    dominio: c.dominio,
    alunoId: c.aluno_id
  }));
}

export async function initContentForStudent(alunoId: string, template: Omit<ContentItem, 'id' | 'alunoId' | 'teoria' | 'pratica' | 'dominio'>[]) {
  const existing = await getContents(alunoId);
  if (existing.length > 0) return;

  const newItems = template.map(t => ({
    aluno_id: alunoId,
    nome: t.nome,
    area: t.area,
    sub_area: t.subArea,
    incidencia: t.incidencia,
    teoria: false,
    pratica: false,
    dominio: false
  }));

  const { error } = await supabase.from('contents').insert(newItems);
  if (error) throw error;
}

export async function toggleContent(id: string, field: 'teoria' | 'pratica' | 'dominio') {
  const { data: current, error: fetchError } = await supabase.from('contents').select(field).eq('id', id).single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from('contents').update({ [field]: !current[field] }).eq('id', id);
  if (error) throw error;
}

// Simulados
export async function getSimulados(alunoId: string): Promise<Simulado[]> {
  const { data, error } = await supabase.from('simulados').select('*').eq('aluno_id', alunoId).order('numero', { ascending: true });
  if (error) throw error;
  if (!data) return [];
  return data.map(s => ({
    id: s.id,
    alunoId: s.aluno_id,
    numero: s.numero,
    data: s.data,
    origem: s.origem,
    linguagens: s.linguagens,
    humanas: s.humanas,
    natureza: s.natureza,
    matematica: s.matematica,
    dificuldadePercebida: s.dificuldade_percebida,
    dificuldadesEncontradas: s.dificuldades_encontradas,
    correcaoLacunas: s.correcao_lacunas,
    erroLacunaConteudo: s.erro_lacuna_conteudo,
    erroDesatencao: s.erro_desatencao,
    erroBanal: s.erro_banal,
    erroConteudoNaoEstudado: s.erro_conteudo_nao_estudado,
    conteudosComLacuna: s.conteudos_com_lacuna,
    questoesAjuda: s.questoes_ajuda,
    questoesAjudaImagem: s.questoes_ajuda_imagem,
    acertosPosRevisao: s.acertos_pos_revisao
  }));
}

export async function addSimulado(s: Omit<Simulado, 'id'>): Promise<Simulado> {
  const { data, error } = await supabase.from('simulados').insert([{
    aluno_id: s.alunoId,
    numero: s.numero,
    data: s.data,
    origem: s.origem,
    linguagens: s.linguagens,
    humanas: s.humanas,
    natureza: s.natureza,
    matematica: s.matematica,
    dificuldade_percebida: s.dificuldadePercebida,
    dificuldades_encontradas: s.dificuldadesEncontradas,
    correcao_lacunas: s.correcaoLacunas,
    erro_lacuna_conteudo: s.erroLacunaConteudo,
    erro_desatencao: s.erroDesatencao,
    erro_banal: s.erroBanal,
    erro_conteudo_nao_estudado: s.erroConteudoNaoEstudado,
    conteudos_com_lacuna: s.conteudosComLacuna,
    questoes_ajuda: s.questoesAjuda,
    questoes_ajuda_imagem: s.questoesAjudaImagem,
    acertos_pos_revisao: s.acertosPosRevisao
  }]).select().single();

  if (error) throw error;
  return { ...s, id: data.id };
}

export async function updateSimulado(id: string, updates: Partial<Simulado>) {
  const dbUpdates: any = {};
  if (updates.numero !== undefined) dbUpdates.numero = updates.numero;
  if (updates.data !== undefined) dbUpdates.data = updates.data;
  if (updates.origem !== undefined) dbUpdates.origem = updates.origem;
  if (updates.linguagens !== undefined) dbUpdates.linguagens = updates.linguagens;
  if (updates.humanas !== undefined) dbUpdates.humanas = updates.humanas;
  if (updates.natureza !== undefined) dbUpdates.natureza = updates.natureza;
  if (updates.matematica !== undefined) dbUpdates.matematica = updates.matematica;
  if (updates.dificuldadePercebida !== undefined) dbUpdates.dificuldade_percebida = updates.dificuldadePercebida;
  if (updates.dificuldadesEncontradas !== undefined) dbUpdates.dificuldades_encontradas = updates.dificuldadesEncontradas;
  if (updates.correcaoLacunas !== undefined) dbUpdates.correcao_lacunas = updates.correcaoLacunas;
  if (updates.erroLacunaConteudo !== undefined) dbUpdates.erro_lacuna_conteudo = updates.erroLacunaConteudo;
  if (updates.erroDesatencao !== undefined) dbUpdates.erro_desatencao = updates.erroDesatencao;
  if (updates.erroBanal !== undefined) dbUpdates.erro_banal = updates.erroBanal;
  if (updates.erroConteudoNaoEstudado !== undefined) dbUpdates.erro_conteudo_nao_estudado = updates.erroConteudoNaoEstudado;
  if (updates.conteudosComLacuna !== undefined) dbUpdates.conteudos_com_lacuna = updates.conteudosComLacuna;
  if (updates.questoesAjuda !== undefined) dbUpdates.questoes_ajuda = updates.questoesAjuda;
  if (updates.questoesAjudaImagem !== undefined) dbUpdates.questoes_ajuda_imagem = updates.questoesAjudaImagem;
  if (updates.acertosPosRevisao !== undefined) dbUpdates.acertos_pos_revisao = updates.acertosPosRevisao;

  const { error } = await supabase.from('simulados').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

// Provas ENEM (Similar flow as Simulados)
export async function getProvasEnem(alunoId: string): Promise<ProvaEnem[]> {
  const { data, error } = await supabase.from('provas_enem').select('*').eq('aluno_id', alunoId).order('ano', { ascending: true });
  if (error) throw error;
  if (!data) return [];
  return data.map(p => ({
    id: p.id,
    alunoId: p.aluno_id,
    ano: p.ano,
    linguagens: p.linguagens,
    humanas: p.humanas,
    natureza: p.natureza,
    matematica: p.matematica,
    dificuldadePercebida: p.dificuldade_percebida,
    dificuldadesEncontradas: p.dificuldades_encontradas,
    correcaoLacunas: p.correcao_lacunas,
    erroLacunaConteudo: p.erro_lacuna_conteudo,
    erroDesatencao: p.erro_desatencao,
    erroBanal: p.erro_banal,
    erroConteudoNaoEstudado: p.erro_conteudo_nao_estudado,
    conteudosComLacuna: p.conteudos_com_lacuna,
    questoesAjuda: p.questoes_ajuda,
    questoesAjudaImagem: p.questoes_ajuda_imagem,
    acertosPosRevisao: p.acertos_pos_revisao
  }));
}

export async function addProvaEnem(p: Omit<ProvaEnem, 'id'>): Promise<ProvaEnem> {
  const { data, error } = await supabase.from('provas_enem').insert([{
    aluno_id: p.alunoId,
    ano: p.ano,
    linguagens: p.linguagens,
    humanas: p.humanas,
    natureza: p.natureza,
    matematica: p.matematica,
    dificuldade_percebida: p.dificuldadePercebida,
    dificuldades_encontradas: p.dificuldadesEncontradas,
    correcao_lacunas: p.correcaoLacunas,
    erro_lacuna_conteudo: p.erroLacunaConteudo,
    erro_desatencao: p.erroDesatencao,
    erro_banal: p.erroBanal,
    erro_conteudo_nao_estudado: p.erroConteudoNaoEstudado,
    conteudos_com_lacuna: p.conteudosComLacuna,
    questoes_ajuda: p.questoesAjuda,
    questoes_ajuda_imagem: p.questoesAjudaImagem,
    acertos_pos_revisao: p.acertosPosRevisao
  }]).select().single();

  if (error) throw error;
  return { ...p, id: data.id };
}

export async function updateProvaEnem(id: string, updates: Partial<ProvaEnem>) {
  const dbUpdates: any = {};
  if (updates.ano !== undefined) dbUpdates.ano = updates.ano;
  if (updates.linguagens !== undefined) dbUpdates.linguagens = updates.linguagens;
  if (updates.humanas !== undefined) dbUpdates.humanas = updates.humanas;
  if (updates.natureza !== undefined) dbUpdates.natureza = updates.natureza;
  if (updates.matematica !== undefined) dbUpdates.matematica = updates.matematica;
  if (updates.dificuldadePercebida !== undefined) dbUpdates.dificuldade_percebida = updates.dificuldadePercebida;
  if (updates.dificuldadesEncontradas !== undefined) dbUpdates.dificuldades_encontradas = updates.dificuldadesEncontradas;
  if (updates.correcaoLacunas !== undefined) dbUpdates.correcao_lacunas = updates.correcaoLacunas;
  if (updates.erroLacunaConteudo !== undefined) dbUpdates.erro_lacuna_conteudo = updates.erroLacunaConteudo;
  if (updates.erroDesatencao !== undefined) dbUpdates.erro_desatencao = updates.erroDesatencao;
  if (updates.erroBanal !== undefined) dbUpdates.erro_banal = updates.erroBanal;
  if (updates.erroConteudoNaoEstudado !== undefined) dbUpdates.erro_conteudo_nao_estudado = updates.erroConteudoNaoEstudado;
  if (updates.conteudosComLacuna !== undefined) dbUpdates.conteudos_com_lacuna = updates.conteudosComLacuna;
  if (updates.questoesAjuda !== undefined) dbUpdates.questoes_ajuda = updates.questoesAjuda;
  if (updates.questoesAjudaImagem !== undefined) dbUpdates.questoes_ajuda_imagem = updates.questoesAjudaImagem;
  if (updates.acertosPosRevisao !== undefined) dbUpdates.acertos_pos_revisao = updates.acertosPosRevisao;

  const { error } = await supabase.from('provas_enem').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

// Planejamento
export async function getPlanejamentos(alunoId: string): Promise<PlanejamentoSemanal[]> {
  const { data, error } = await supabase.from('planejamento').select('*').eq('aluno_id', alunoId);
  if (error) throw error;
  if (!data) return [];
  return data.map(p => ({
    id: p.id,
    alunoId: p.aluno_id,
    semana: p.semana,
    conteudos: p.conteudos,
    listas: p.listas,
    simulados: p.simulados,
    observacoes: p.observacoes
  }));
}

export async function savePlanejamento(p: PlanejamentoSemanal) {
  const { error } = await supabase.from('planejamento').upsert({
    id: p.id,
    aluno_id: p.alunoId,
    semana: p.semana,
    conteudos: p.conteudos,
    listas: p.listas,
    simulados: p.simulados,
    observacoes: p.observacoes
  });
  if (error) throw error;
}

// Mentor Observações
export async function getMentorObservacoes(alunoId: string): Promise<MentorObservacao[]> {
  const { data, error } = await supabase.from('mentor_obs').select('*').eq('aluno_id', alunoId).order('data', { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return data.map(d => ({ id: d.id, alunoId: d.aluno_id, texto: d.texto, data: d.data }));
}

export async function addMentorObservacao(alunoId: string, texto: string): Promise<MentorObservacao> {
  const { data, error } = await supabase.from('mentor_obs').insert([{ aluno_id: alunoId, texto }]).select().single();
  if (error) throw error;
  return { id: data.id, alunoId, texto, data: data.data };
}

// Checkpoints Semanais
export async function getCheckpoints(alunoId: string): Promise<CheckpointSemanal[]> {
  const { data, error } = await supabase.from('checkpoints').select('*').eq('aluno_id', alunoId).order('data', { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return data.map(d => ({ id: d.id, alunoId: d.aluno_id, data: d.data, foco: d.foco || '', dificuldades: d.dificuldades || '', tarefas: d.tarefas || '' }));
}

export async function addCheckpoint(alunoId: string, foco: string, dificuldades: string, tarefas: string): Promise<CheckpointSemanal> {
  const { data, error } = await supabase.from('checkpoints').insert([{ aluno_id: alunoId, foco, dificuldades, tarefas }]).select().single();
  if (error) throw error;
  return { id: data.id, alunoId, data: data.data, foco, dificuldades, tarefas };
}

// Dúvidas
export async function getDuvidas(): Promise<Duvida[]> {
  const { data, error } = await supabase.from('duvidas').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  if (!data) return [];
  return data.map(d => ({
    id: d.id,
    alunoId: d.aluno_id,
    nomeAluno: d.nome_aluno,
    titulo: d.titulo,
    disciplina: d.disciplina,
    texto: d.texto,
    imagemUrl: d.imagem_url,
    status: d.status as any,
    resposta: d.resposta,
    respostaImagemUrl: d.resposta_imagem_url,
    createdAt: d.created_at,
    respondedAt: d.responded_at
  }));
}

export async function getDuvidasByAluno(alunoId: string): Promise<Duvida[]> {
  const all = await getDuvidas();
  return all.filter(d => d.alunoId === alunoId);
}

export async function addDuvida(d: Omit<Duvida, 'id' | 'status' | 'createdAt'>): Promise<Duvida> {
  const { data, error } = await supabase.from('duvidas').insert([{
    aluno_id: d.alunoId,
    nome_aluno: d.nomeAluno,
    titulo: d.titulo,
    disciplina: d.disciplina,
    texto: d.texto,
    imagem_url: d.imagemUrl
  }]).select().single();
  
  if (error) throw error;
  return { ...d, id: data.id, status: 'pendente', createdAt: data.created_at };
}

export async function responderDuvida(id: string, resposta: string, respostaImagemUrl?: string) {
  const { error } = await supabase.from('duvidas').update({
    resposta,
    resposta_imagem_url: respostaImagemUrl,
    status: 'respondida',
    responded_at: new Date().toISOString()
  }).eq('id', id);
  if (error) throw error;
}

// Mapa de Lacunas (TAB)
export async function getTABRecords(alunoId: string): Promise<TABRecord[]> {
  const { data, error } = await supabase.from('tab_records').select('*').eq('aluno_id', alunoId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id,
    alunoId: r.aluno_id,
    provaAno: r.prova_ano,
    bloco: r.bloco,
    questoes: r.questoes as any,
    createdAt: r.created_at
  }));
}

export async function addTABRecord(r: Omit<TABRecord, 'id' | 'createdAt'>): Promise<TABRecord> {
  const { data, error } = await supabase.from('tab_records').insert([{
    aluno_id: r.alunoId,
    prova_ano: r.provaAno,
    bloco: r.bloco,
    questoes: r.questoes
  }]).select().single();
  
  if (error) throw error;
  return { ...r, id: data.id, createdAt: data.created_at };
}

export async function updateTABRecord(id: string, updates: Partial<TABRecord>) {
  const dbUpdates: any = {};
  if (updates.provaAno !== undefined) dbUpdates.prova_ano = updates.provaAno;
  if (updates.bloco !== undefined) dbUpdates.bloco = updates.bloco;
  if (updates.questoes !== undefined) dbUpdates.questoes = updates.questoes;

  const { error } = await supabase.from('tab_records').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function deleteTABRecord(id: string) {
  const { error } = await supabase.from('tab_records').delete().eq('id', id);
  if (error) throw error;
}
