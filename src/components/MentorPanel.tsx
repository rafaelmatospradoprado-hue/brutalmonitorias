import React, { useState } from 'react';
import { getStudents, getSimulados, getProvasEnem, getContents, getMentorObservacoes, addMentorObservacao } from '@/lib/store';
import { Student, MentorObservacao } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, ChevronDown, ChevronRight, Shield } from 'lucide-react';

const MENTOR_PASSWORD = 'Enzimas';

export default function MentorPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [newObs, setNewObs] = useState('');
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
            const teoriaCount = contents.filter(c => c.teoria).length;
            const praticaCount = contents.filter(c => c.pratica).length;
            const dominioCount = contents.filter(c => c.dominio).length;
            const pct = s.meta > s.acertosIniciais ? Math.round(((s.acertosAtuais - s.acertosIniciais) / (s.meta - s.acertosIniciais)) * 100) : 0;

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
                    <div className="text-xs text-muted-foreground">
                      Teoria: {teoriaCount} • Prática: {praticaCount} • Domínio: {dominioCount}
                    </div>

                    {/* Observações do Mentor */}
                    <div className="border-t border-border pt-3">
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
