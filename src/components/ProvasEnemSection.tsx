import React, { useState, useEffect } from 'react';
import { ProvaEnem } from '@/types';
import { getProvasEnem, addProvaEnem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props { alunoId: string; }

const anos = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const dificuldadeReferencia: Record<number, number> = {
  2016: 7.0, 2017: 8.0, 2018: 8.5, 2019: 5.5, 2020: 5.5,
  2021: 6.0, 2022: 7.0, 2023: 5.0, 2024: 0, 2025: 0,
};

function getDiffColor(d: number) {
  if (d === 0) return 'text-muted-foreground';
  if (d <= 5.5) return 'text-green-400';
  if (d <= 7.0) return 'text-yellow-400';
  return 'text-red-400';
}

export default function ProvasEnemSection({ alunoId }: Props) {
  const [provas, setProvas] = useState<ProvaEnem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ano: 2024, linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
    dificuldadePercebida: 'Médio', dificuldadesEncontradas: '', correcaoLacunas: false
  });

  useEffect(() => { setProvas(getProvasEnem(alunoId)); }, [alunoId]);

  const handleAdd = () => {
    addProvaEnem({ alunoId, ...form });
    setProvas(getProvasEnem(alunoId));
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="font-display text-2xl text-primary">PROVAS ENEM</h2>
        <div className="flex items-center gap-2">
          <a
            href="https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> Provas Oficiais INEP
          </a>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-1" /> Nova Prova</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-primary">Registrar Prova ENEM</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={String(form.ano)} onValueChange={v => setForm({ ...form, ano: Number(v) })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>{anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Linguagens" value={form.linguagens || ''} onChange={e => setForm({ ...form, linguagens: Number(e.target.value) })} className="bg-background border-border" />
                  <Input type="number" placeholder="Humanas" value={form.humanas || ''} onChange={e => setForm({ ...form, humanas: Number(e.target.value) })} className="bg-background border-border" />
                  <Input type="number" placeholder="Natureza" value={form.natureza || ''} onChange={e => setForm({ ...form, natureza: Number(e.target.value) })} className="bg-background border-border" />
                  <Input type="number" placeholder="Matemática" value={form.matematica || ''} onChange={e => setForm({ ...form, matematica: Number(e.target.value) })} className="bg-background border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Dificuldade percebida</label>
                  <Select value={form.dificuldadePercebida} onValueChange={v => setForm({ ...form, dificuldadePercebida: v })}>
                    <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Fácil', 'Médio', 'Difícil', 'Muito Difícil'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Principais dificuldades</label>
                  <Textarea value={form.dificuldadesEncontradas} onChange={e => setForm({ ...form, dificuldadesEncontradas: e.target.value })} className="bg-background border-border text-sm min-h-[60px]" placeholder="Descreva as dificuldades..." />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.correcaoLacunas} onChange={e => setForm({ ...form, correcaoLacunas: e.target.checked })} className="accent-primary" />
                  <label className="text-sm text-foreground">Correção de lacunas realizada</label>
                </div>
                <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Referência de dificuldade */}
      <div className="mb-6 p-3 bg-card border border-border rounded-lg">
        <h3 className="font-display text-xs text-muted-foreground mb-2">REFERÊNCIA DE DIFICULDADE MÉDIA DAS PROVAS</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {anos.filter(a => dificuldadeReferencia[a] > 0).sort((a, b) => dificuldadeReferencia[a] - dificuldadeReferencia[b]).map(a => (
            <div key={a} className="flex items-center gap-1">
              <span className="text-muted-foreground">{a}:</span>
              <span className={`font-display ${getDiffColor(dificuldadeReferencia[a])}`}>{dificuldadeReferencia[a]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {provas.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma prova registrada.</p>}
        {provas.sort((a, b) => a.ano - b.ano).map(p => {
          const total = p.linguagens + p.humanas + p.natureza + p.matematica;
          const ref = dificuldadeReferencia[p.ano];
          return (
            <div key={p.id} className="p-4 bg-card border border-border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg text-foreground">ENEM {p.ano}</span>
                  {ref > 0 && <span className={`text-xs ${getDiffColor(ref)}`}>(dif. {ref})</span>}
                </div>
                <span className="font-display text-xl text-primary">{total} acertos</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <span>Linguagens: {p.linguagens}</span>
                <span>Humanas: {p.humanas}</span>
                <span>Natureza: {p.natureza}</span>
                <span>Matemática: {p.matematica}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs pt-1 border-t border-border">
                <span className="text-muted-foreground">Dificuldade: <span className="text-foreground">{p.dificuldadePercebida || '—'}</span></span>
                <span className="text-muted-foreground">Correção lacunas: <span className="text-foreground">{p.correcaoLacunas ? 'Sim ✔' : 'Não ✘'}</span></span>
              </div>
              {p.dificuldadesEncontradas && (
                <p className="text-xs text-muted-foreground italic">"{p.dificuldadesEncontradas}"</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
