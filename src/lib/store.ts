import { Student, ContentItem, Simulado, ProvaEnem, PlanejamentoSemanal, MentorObservacao, CheckpointSemanal } from '@/types';

function get<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Students
export function getStudents(): Student[] { return get('brutal_students', []); }
export function saveStudents(s: Student[]) { set('brutal_students', s); }
export function addStudent(s: Omit<Student, 'id' | 'createdAt'>): Student {
  const students = getStudents();
  const newStudent: Student = { ...s, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}
export function updateStudent(id: string, data: Partial<Student>) {
  const students = getStudents().map(s => s.id === id ? { ...s, ...data } : s);
  saveStudents(students);
}

// Content
export function getContents(alunoId: string): ContentItem[] {
  return get<ContentItem[]>('brutal_contents', []).filter(c => c.alunoId === alunoId);
}
export function getAllContents(): ContentItem[] { return get('brutal_contents', []); }
export function saveContents(c: ContentItem[]) { set('brutal_contents', c); }
export function initContentForStudent(alunoId: string, template: Omit<ContentItem, 'id' | 'alunoId' | 'teoria' | 'pratica' | 'dominio'>[]) {
  const all = getAllContents();
  const existing = all.filter(c => c.alunoId === alunoId);
  if (existing.length > 0) return;
  const newItems: ContentItem[] = template.map(t => ({
    ...t, id: crypto.randomUUID(), alunoId, teoria: false, pratica: false, dominio: false
  }));
  saveContents([...all, ...newItems]);
}
export function toggleContent(id: string, field: 'teoria' | 'pratica' | 'dominio') {
  const all = getAllContents();
  const updated = all.map(c => c.id === id ? { ...c, [field]: !c[field] } : c);
  saveContents(updated);
}

// Simulados
export function getSimulados(alunoId: string): Simulado[] {
  return get<Simulado[]>('brutal_simulados', []).filter(s => s.alunoId === alunoId);
}
export function addSimulado(s: Omit<Simulado, 'id'>): Simulado {
  const all = get<Simulado[]>('brutal_simulados', []);
  const newS: Simulado = { ...s, id: crypto.randomUUID() };
  all.push(newS);
  set('brutal_simulados', all);
  return newS;
}

// Provas ENEM
export function getProvasEnem(alunoId: string): ProvaEnem[] {
  return get<ProvaEnem[]>('brutal_provas', []).filter(p => p.alunoId === alunoId);
}
export function addProvaEnem(p: Omit<ProvaEnem, 'id'>): ProvaEnem {
  const all = get<ProvaEnem[]>('brutal_provas', []);
  const newP: ProvaEnem = { ...p, id: crypto.randomUUID() };
  all.push(newP);
  set('brutal_provas', all);
  return newP;
}

// Planejamento
export function getPlanejamentos(alunoId: string): PlanejamentoSemanal[] {
  return get<PlanejamentoSemanal[]>('brutal_planejamento', []).filter(p => p.alunoId === alunoId);
}
export function savePlanejamento(p: PlanejamentoSemanal) {
  const all = get<PlanejamentoSemanal[]>('brutal_planejamento', []);
  const idx = all.findIndex(x => x.id === p.id);
  if (idx >= 0) all[idx] = p; else all.push(p);
  set('brutal_planejamento', all);
}

// Mentor Observações
export function getMentorObservacoes(alunoId: string): MentorObservacao[] {
  return get<MentorObservacao[]>('brutal_mentor_obs', []).filter(o => o.alunoId === alunoId);
}
export function addMentorObservacao(alunoId: string, texto: string): MentorObservacao {
  const all = get<MentorObservacao[]>('brutal_mentor_obs', []);
  const obs: MentorObservacao = { id: crypto.randomUUID(), alunoId, texto, data: new Date().toISOString() };
  all.push(obs);
  set('brutal_mentor_obs', all);
  return obs;
}

// Checkpoints Semanais
export function getCheckpoints(alunoId: string): CheckpointSemanal[] {
  return get<CheckpointSemanal[]>('brutal_checkpoints', []).filter(c => c.alunoId === alunoId);
}
export function addCheckpoint(alunoId: string, foco: string, dificuldades: string, tarefas: string): CheckpointSemanal {
  const all = get<CheckpointSemanal[]>('brutal_checkpoints', []);
  const checkpoint: CheckpointSemanal = { id: crypto.randomUUID(), alunoId, data: new Date().toISOString(), foco, dificuldades, tarefas };
  all.push(checkpoint);
  set('brutal_checkpoints', all);
  return checkpoint;
}
