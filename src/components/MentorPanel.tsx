import React, { useState, useEffect } from 'react';
import { 
  getStudents, 
  updateStudent,
  getSimulados, 
  getProvasEnem, 
  getContents, 
  getMentorObservacoes, 
  addMentorObservacao, 
  getCheckpoints, 
  addCheckpoint, 
  getDuvidasByAluno, 
  responderDuvida 
} from '@/lib/store';
import { Student, Simulado, ProvaEnem, ContentItem, MentorObservacao, CheckpointSemanal, Duvida } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, ChevronDown, ChevronRight, Shield, CalendarCheck, MessageSquare, ImagePlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const MENTOR_PASSWORD = 'Enzimas';

type Tab = 'obs' | 'checkpoint' | 'duvidas';

export default function MentorPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authenticated) {
      const fetchStudents = async () => {
        try {
          const data = await getStudents();
          setStudents(data);
        } catch (err) {
          console.error('Erro ao buscar alunos:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (password === MENTOR_PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center h-64">
        <Shield className="h-10 w-10 text-primary mb-4" />
        <h2 className="font-display text-xl text-primary mb-4">PAINEL DO MENTOR</h2>
        <p className="text-muted-foreground text-sm mb-4">Acesso restrito. Digite a senha para continuar.</p>
        <div className="flex gap-2 w-64">
          <Input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Senha do mentor"
            className="bg-background border-border"
          />
          <Button onClick={handleLogin} className="bg-primary text-primary-foreground">
            <Lock className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-destructive text-xs mt-2">Senha incorreta.</p>}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl text-primary">PAINEL DO MENTOR</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum aluno cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {students.map(s => (
            <StudentMentorView key={s.id} student={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentMentorView({ student: initialStudent }: { student: Student }) {
  const [s, setStudent] = useState(initialStudent);
  const [isOpen, setIsOpen] = useState(false);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [provas, setProvas] = useState<ProvaEnem[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [obs, setObs] = useState<MentorObservacao[]>([]);
  const [checkpoints, setCheckpoints] = useState<CheckpointSemanal[]>([]);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('obs');
  const [newObs, setNewObs] = useState('');
  const [checkForm, setCheckForm] = useState({ foco: '', dificuldades: '', tarefas: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sims, provs, conts, o, checks, d] = await Promise.all([
        getSimulados(s.id),
        getProvasEnem(s.id),
        getContents(s.id),
        getMentorObservacoes(s.id),
        getCheckpoints(s.id),
        getDuvidasByAluno(s.id)
      ]);
      setSimulados(sims);
      setProvas(provs);
      setContents(conts);
      setObs(o);
      setCheckpoints(checks);
      setDuvidas(d);
    } catch (err) {
      console.error('Erro ao buscar dados do aluno:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleAddObs = async () => {
    if (!newObs.trim()) return;
    try {
      await addMentorObservacao(s.id, newObs.trim());
      setNewObs('');
      const updatedObs = await getMentorObservacoes(s.id);
      setObs(updatedObs);
    } catch (err) {
      console.error('Erro ao adicionar observação:', err);
    }
  };

  const handleAddCheckpoint = async () => {
    if (!checkForm.foco.trim() && !checkForm.tarefas.trim()) return;
    try {
      await addCheckpoint(s.id, checkForm.foco, checkForm.dificuldades, checkForm.tarefas);
      setCheckForm({ foco: '', dificuldades: '', tarefas: '' });
      const updatedChecks = await getCheckpoints(s.id);
      setCheckpoints(updatedChecks);
    } catch (err) {
      console.error('Erro ao adicionar checkpoint:', err);
    }
  };

  const handleUpdateFicha = async (val: string) => {
    try {
      await updateStudent(s.id, { fichaTecnica: val });
      setStudent(prev => ({ ...prev, fichaTecnica: val }));
    } catch (err) {
      console.error('Erro ao atualizar ficha técnica:', err);
    }
  };

  const handleReplyDuvida = async (duvidaId: string, txt: string, img?: string) => {
    try {
      await responderDuvida(duvidaId, txt, img);
      const updated = await getDuvidasByAluno(s.id);
      setDuvidas(updated);
    } catch (err) {
      console.error('Erro ao responder dúvida:', err);
    }
  };

  const dominioCount = contents.filter(c => c.dominio).length;
  const pct = s.meta > s.acertosIniciais ? Math.round(((s.acertosAtuais - s.acertosIniciais) / (s.meta - s.acertosIniciais)) * 100) : 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-display text-foreground">{s.nome}</span>
          <span className="text-xs text-muted-foreground">({s.objetivo})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{s.acertosAtuais}/{s.meta}</span>
          <div className="w-16 bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-card/50">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-background rounded border border-border">
                  <span className="text-muted-foreground block">Simulados</span>
                  <span className="font-display text-lg text-foreground">{simulados.length}</span>
                </div>
                <div className="p-2 bg-background rounded border border-border">
                  <span className="text-muted-foreground block">Provas ENEM</span>
                  <span className="font-display text-lg text-foreground">{provas.length}</span>
                </div>
                <div className="p-2 bg-background rounded border border-border">
                  <span className="text-muted-foreground block">Conteúdos</span>
                  <span className="font-display text-lg text-foreground">{contents.length}</span>
                </div>
                <div className="p-2 bg-background rounded border border-border">
                  <span className="text-muted-foreground block">Domínio</span>
                  <span className="font-display text-lg text-foreground">{dominioCount}/{contents.length}</span>
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="text-xs font-display text-primary mb-2 uppercase tracking-wider">Ficha Técnica do Aluno</h4>
                <Textarea 
                   value={s.fichaTecnica || ''} 
                   onChange={e => handleUpdateFicha(e.target.value)}
                   placeholder="O perfil desse aluno, pontos fortes, estilo de aprendizagem..."
                   className="bg-background border-border text-sm min-h-[80px]"
                />
              </div>

              {/* Tabs */}
              <div className="border-t border-border pt-3">
                <div className="flex gap-1 mb-4">
                  <button
                    onClick={() => setTab('obs')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${tab === 'obs' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Observações ({obs.length})
                  </button>
                  <button
                    onClick={() => setTab('checkpoint')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${tab === 'checkpoint' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Checkpoint Semanal ({checkpoints.length})
                  </button>
                  <button
                    onClick={() => setTab('duvidas')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${tab === 'duvidas' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Dúvidas ({duvidas.length})
                  </button>
                </div>

                {tab === 'obs' && (
                  <div>
                    <h4 className="font-display text-sm text-primary mb-2">Observações do Mentor</h4>
                    {obs.length === 0 && <p className="text-xs text-muted-foreground mb-2">Nenhuma observação registrada.</p>}
                    <div className="space-y-2 mb-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {obs.map(o => (
                        <div key={o.id} className="p-2 bg-background rounded border border-border text-xs">
                          <span className="text-muted-foreground font-medium">{new Date(o.data).toLocaleDateString('pt-BR')}:</span>
                          <p className="text-foreground mt-0.5 whitespace-pre-wrap">{o.texto}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={newObs}
                        onChange={e => setNewObs(e.target.value)}
                        placeholder="Adicionar observação sobre o aluno..."
                        className="bg-background border-border text-sm min-h-[40px]"
                      />
                      <Button size="sm" onClick={handleAddObs} className="bg-primary text-primary-foreground self-end">
                        Salvar
                      </Button>
                    </div>
                  </div>
                )}

                {tab === 'duvidas' && (
                  <div className="space-y-4">
                    <h4 className="font-display text-sm text-primary">Tira-Dúvidas do Aluno</h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                      {duvidas.slice().reverse().map(d => (
                        <div key={d.id} className="p-3 bg-background rounded-lg border border-border space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={d.status === 'pendente' ? 'secondary' : 'default'} className="text-[9px]">
                              {d.status === 'pendente' ? 'Pendente' : 'Respondida'}
                            </Badge>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-foreground">{d.titulo}</h5>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">"{d.texto}"</p>
                          
                          {d.imagemUrl && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="text-[10px] text-primary hover:underline flex items-center gap-1">
                                  <ImagePlus className="h-3 w-3" /> Ver anexo do aluno
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-card border-border">
                                <img src={d.imagemUrl} alt="Dúvida" className="w-full h-auto rounded" />
                              </DialogContent>
                            </Dialog>
                          )}

                          {d.status === 'respondida' ? (
                            <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded text-xs space-y-1">
                              <p className="font-bold text-primary">Sua resposta:</p>
                              <p className="text-foreground whitespace-pre-wrap">{d.resposta}</p>
                              {d.respostaImagemUrl && (
                                <img src={d.respostaImagemUrl} alt="Sua resposta" className="mt-2 max-h-32 rounded object-contain border border-border" />
                              )}
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              <Textarea 
                                placeholder="Escreva sua resposta técnica aqui..."
                                className="bg-card border-border text-xs min-h-[60px]"
                                onBlur={(e) => {
                                  (window as any)[`reply_${d.id}`] = e.target.value;
                                }}
                              />
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                   <input 
                                    type="file" 
                                    id={`file_${d.id}`} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          if (typeof reader.result === 'string') {
                                            (window as any)[`img_${d.id}`] = reader.result;
                                            // Force re-render of just this part if needed, 
                                            // but for simplicity we rely on next trigger
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor={`file_${d.id}`}
                                    className="text-[10px] text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-1"
                                  >
                                    <ImagePlus className="h-3.5 w-3.5" /> 
                                    {(window as any)[`img_${d.id}`] ? "Trocar imagem" : "Anexar resolução"}
                                  </label>
                                  {(window as any)[`img_${d.id}`] && (
                                    <img src={(window as any)[`img_${d.id}`]} className="mt-1 h-8 rounded border border-border" alt="Preview" />
                                  )}
                                </div>
                                <Button 
                                  size="sm" 
                                  className="h-7 text-[10px] px-3"
                                  onClick={() => {
                                    const txt = (window as any)[`reply_${d.id}`];
                                    const img = (window as any)[`img_${d.id}`];
                                    if (!txt && !img) return;
                                    handleReplyDuvida(d.id, txt || '', img);
                                    delete (window as any)[`reply_${d.id}`];
                                    delete (window as any)[`img_${d.id}`];
                                  }}
                                >
                                  Enviar Resposta
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {duvidas.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-center py-4">O aluno ainda não enviou dúvidas.</p>
                      )}
                    </div>
                  </div>
                )}

                {tab === 'checkpoint' && (
                  <div>
                    <h4 className="font-display text-sm text-primary mb-2">Checkpoint Semanal (Quarta-feira)</h4>
                    
                    {checkpoints.length > 0 && (
                      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {[...checkpoints].reverse().map(c => (
                          <div key={c.id} className="p-3 bg-background rounded border border-border text-xs space-y-1.5">
                            <div className="text-muted-foreground font-medium">
                              {new Date(c.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                            </div>
                            {c.foco && <div><span className="text-primary">Foco:</span> <span className="text-foreground">{c.foco}</span></div>}
                            {c.dificuldades && <div><span className="text-yellow-400">Dificuldades:</span> <span className="text-foreground">{c.dificuldades}</span></div>}
                            {c.tarefas && <div><span className="text-emerald-400">Tarefas:</span> <span className="text-foreground">{c.tarefas}</span></div>}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 border border-border rounded-lg p-3 bg-background">
                      <p className="text-xs text-muted-foreground font-medium">Novo checkpoint:</p>
                      <div>
                        <label className="text-xs text-primary mb-1 block">Foco da semana</label>
                        <Textarea
                          value={checkForm.foco}
                          onChange={e => setCheckForm(f => ({ ...f, foco: e.target.value }))}
                          placeholder="O que o aluno vai focar essa semana..."
                          className="bg-card border-border text-sm min-h-[40px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-yellow-400 mb-1 block">Dificuldades observadas</label>
                        <Textarea
                          value={checkForm.dificuldades}
                          onChange={e => setCheckForm(f => ({ ...f, dificuldades: e.target.value }))}
                          placeholder="Dificuldades percebidas no aluno..."
                          className="bg-card border-border text-sm min-h-[40px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-emerald-400 mb-1 block">Tarefas definidas</label>
                        <Textarea
                          value={checkForm.tarefas}
                          onChange={e => setCheckForm(f => ({ ...f, tarefas: e.target.value }))}
                          placeholder="Tarefas e exercícios para a semana..."
                          className="bg-card border-border text-sm min-h-[40px]"
                        />
                      </div>
                      <Button size="sm" onClick={handleAddCheckpoint} className="bg-primary text-primary-foreground w-full">
                        Registrar Checkpoint
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
