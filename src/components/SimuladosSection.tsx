import React, { useState, useEffect } from 'react';
import { Simulado } from '@/types';
import { getSimulados, addSimulado } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props { alunoId: string; }

export default function SimuladosSection({ alunoId }: Props) {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    numero: 1, data: '', origem: 'Plataforma Assad',
    linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
    dificuldadePercebida: 'Médio', dificuldadesEncontradas: '', correcaoLacunas: false
  });

  useEffect(() => { setSimulados(getSimulados(alunoId)); }, [alunoId]);

  const handleAdd = () => {
    addSimulado({ alunoId, ...form });
    setSimulados(getSimulados(alunoId));
    setForm({ numero: simulados.length + 2, data: '', origem: 'Plataforma Assad', linguagens: 0, humanas: 0, natureza: 0, matematica: 0, dificuldadePercebida: 'Médio', dificuldadesEncontradas: '', correcaoLacunas: false });
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-primary">SIMULADOS PLATAFORMA ASSAD</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display text-primary">Registrar Simulado – Plataforma Assad</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nº do Simulado</label>
                  <Input type="number" value={form.numero} onChange={e => setForm({ ...form, numero: Number(e.target.value) })} className="bg-background border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data</label>
                  <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="bg-background border-border" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Origem</label>
                <Input value={form.origem} readOnly className="bg-background border-border text-muted-foreground" />
              </div>
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
                <label className="text-xs text-muted-foreground mb-1 block">Dificuldades encontradas</label>
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

      <div className="space-y-3">
        {simulados.length === 0 && <p className="text-muted-foreground text-sm">Nenhum simulado registrado.</p>}
        {simulados.map(s => {
          const total = s.linguagens + s.humanas + s.natureza + s.matematica;
          return (
            <div key={s.id} className="p-4 bg-card border border-border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-display text-foreground">Simulado #{s.numero}</span>
                  <span className="text-xs text-muted-foreground ml-2">{s.data}</span>
                  <span className="text-xs text-muted-foreground ml-2">• {s.origem}</span>
                </div>
                <span className="font-display text-xl text-primary">{total} acertos</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <span>Linguagens: {s.linguagens}</span>
                <span>Humanas: {s.humanas}</span>
                <span>Natureza: {s.natureza}</span>
                <span>Matemática: {s.matematica}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs pt-1 border-t border-border">
                <span className="text-muted-foreground">Dificuldade: <span className="text-foreground">{s.dificuldadePercebida || '—'}</span></span>
                <span className="text-muted-foreground">Correção lacunas: <span className="text-foreground">{s.correcaoLacunas ? 'Sim ✔' : 'Não ✘'}</span></span>
              </div>
              {s.dificuldadesEncontradas && (
                <p className="text-xs text-muted-foreground italic">"{s.dificuldadesEncontradas}"</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
