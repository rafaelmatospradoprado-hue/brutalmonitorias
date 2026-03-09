import React, { useState, useEffect } from 'react';
import { Simulado } from '@/types';
import { getSimulados, addSimulado } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props { alunoId: string; }

export default function SimuladosSection({ alunoId }: Props) {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ data: '', linguagens: 0, humanas: 0, natureza: 0, matematica: 0 });

  useEffect(() => { setSimulados(getSimulados(alunoId)); }, [alunoId]);

  const handleAdd = () => {
    addSimulado({ alunoId, ...form });
    setSimulados(getSimulados(alunoId));
    setForm({ data: '', linguagens: 0, humanas: 0, natureza: 0, matematica: 0 });
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-primary">SIMULADOS</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Novo Simulado
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="font-display text-primary">Registrar Simulado</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="bg-background border-border" />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Linguagens" value={form.linguagens || ''} onChange={e => setForm({ ...form, linguagens: Number(e.target.value) })} className="bg-background border-border" />
                <Input type="number" placeholder="Humanas" value={form.humanas || ''} onChange={e => setForm({ ...form, humanas: Number(e.target.value) })} className="bg-background border-border" />
                <Input type="number" placeholder="Natureza" value={form.natureza || ''} onChange={e => setForm({ ...form, natureza: Number(e.target.value) })} className="bg-background border-border" />
                <Input type="number" placeholder="Matemática" value={form.matematica || ''} onChange={e => setForm({ ...form, matematica: Number(e.target.value) })} className="bg-background border-border" />
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
            <div key={s.id} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-display text-foreground">{s.data}</span>
                <span className="font-display text-xl text-primary">{total} acertos</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <span>Linguagens: {s.linguagens}</span>
                <span>Humanas: {s.humanas}</span>
                <span>Natureza: {s.natureza}</span>
                <span>Matemática: {s.matematica}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
