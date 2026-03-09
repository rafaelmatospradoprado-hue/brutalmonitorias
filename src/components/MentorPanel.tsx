import React, { useState } from 'react';
import { getStudents, getSimulados, getProvasEnem, getContents, getMentorObservacoes, addMentorObservacao, getCheckpoints, addCheckpoint } from '@/lib/store';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, ChevronDown, ChevronRight, Shield, CalendarCheck, MessageSquare } from 'lucide-react';

const MENTOR_PASSWORD = 'Enzimas';

type Tab = 'obs' | 'checkpoint';

export default function MentorPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, Tab>>({});
  const [newObs, setNewObs] = useState('');
  const [checkForm, setCheckForm] = useState({ foco: '', dificuldades: '', tarefas: '' });
  const [refresh, setRefresh] = useState(0);

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

  const students = getStudents();

  const handleAddObs = (alunoId: string) => {
    if (!newObs.trim()) return;
    addMentorObservacao(alunoId, newObs.trim());
    setNewObs('');
    setRefresh(r => r + 1);
  };

  const handleAddCheckpoint = (alunoId: string) => {
    if (!checkForm.foco.trim() && !checkForm.tarefas.trim()) return;
    addCheckpoint(alunoId, checkForm.foco, checkForm.dificuldades, checkForm.tarefas);
    setCheckForm({ foco: '', dificuldades: '', tarefas: '' });
    setRefresh(r => r + 1);
  };

  const getTab = (id: string): Tab => activeTab[id] ?? 'obs';
  const setTab = (id: string, tab: Tab) => setActiveTab(prev => ({ ...prev, [id]: tab }));

  return (
    <div className="animate-fade-in" key={refresh}>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl text-primary">PAINEL DO MENTOR</h2>
      </div>

      {students.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum aluno cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {students.map(s => {
            const isOpen = expandedStudent === s.id;
            const simulados = getSimulados(s.id);
            const provas = getProvasEnem(s.id);
            const contents = getContents(s.id);
            const obs = getMentorObservacoes(s.id);
            const checkpoints = getCheckpoints(s.id);
            const dominioCount = contents.filter(c => c.dominio).length;
            const pct = s.meta > s.acertosIniciais ? Math.round(((s.acertosAtuais - s.acertosIniciais) / (s.meta - s.acertosIniciais)) * 100) : 0;
            const tab = getTab(s.id);

            return (
              <div key={s.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedStudent(isOpen ? null : s.id)}
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

                    {/* Tabs */}
                    <div className="border-t border-border pt-3">
                      <div className="flex gap-1 mb-4">
                        <button
                          onClick={() => setTab(s.id, 'obs')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${tab === 'obs' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Observações ({obs.length})
                        </button>
                        <button
                          onClick={() => setTab(s.id, 'checkpoint')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${tab === 'checkpoint' ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'}`}
                        >
                          <CalendarCheck className="h-3.5 w-3.5" />
                          Checkpoint Semanal ({checkpoints.length})
                        </button>
                      </div>

                      {/* Observações Tab */}
                      {tab === 'obs' && (
                        <div>
                          <h4 className="font-display text-sm text-primary mb-2">Observações do Mentor</h4>
                          {obs.length === 0 && <p className="text-xs text-muted-foreground mb-2">Nenhuma observação registrada.</p>}
                          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                            {obs.map(o => (
                              <div key={o.id} className="p-2 bg-background rounded border border-border text-xs">
                                <span className="text-muted-foreground">{new Date(o.data).toLocaleDateString('pt-BR')}:</span>
                                <p className="text-foreground mt-0.5">{o.texto}</p>
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
                            <Button size="sm" onClick={() => handleAddObs(s.id)} className="bg-primary text-primary-foreground self-end">
                              Salvar
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Checkpoint Tab */}
                      {tab === 'checkpoint' && (
                        <div>
                          <h4 className="font-display text-sm text-primary mb-2">Checkpoint Semanal (Quarta-feira)</h4>
                          
                          {/* History */}
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

                          {/* New Checkpoint Form */}
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
                            <Button size="sm" onClick={() => handleAddCheckpoint(s.id)} className="bg-primary text-primary-foreground w-full">
                              Registrar Checkpoint
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
