import React, { useState, useEffect } from 'react';
import { ProvaEnem } from '@/types';
import { getProvasEnem, addProvaEnem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props { alunoId: string; }

const anos = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export default function ProvasEnemSection({ alunoId }: Props) {
  const [provas, setProvas] = useState<ProvaEnem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ano: 2024, linguagens: 0, humanas: 0, natureza: 0, matematica: 0 });

  useEffect(() => { setProvas(getProvasEnem(alunoId)); }, [alunoId]);

  const handleAdd = () => {
    addProvaEnem({ alunoId, ...form });
    setProvas(getProvasEnem(alunoId));
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-primary">PROVAS ENEM</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-1" /> Nova Prova</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
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
              <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {provas.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma prova registrada.</p>}
        {provas.sort((a, b) => a.ano - b.ano).map(p => {
          const total = p.linguagens + p.humanas + p.natureza + p.matematica;
          return (
            <div key={p.id} className="p-4 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-display text-lg text-foreground">ENEM {p.ano}</span>
                <span className="font-display text-xl text-primary">{total} acertos</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <span>Linguagens: {p.linguagens}</span>
                <span>Humanas: {p.humanas}</span>
                <span>Natureza: {p.natureza}</span>
                <span>Matemática: {p.matematica}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
