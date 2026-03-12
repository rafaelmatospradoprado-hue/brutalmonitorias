import React, { useState } from 'react';
import { Student } from '@/types';
import { useStudents } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Props {
  onSelectStudent: (id: string) => void;
  selectedStudentId: string | null;
}

export default function StudentsSection({ onSelectStudent, selectedStudentId }: Props) {
  const { students, addStudent } = useStudents();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', objetivo: '', acertosIniciais: 0, meta: 150 });

  const handleAdd = async () => {
    if (!form.nome) return;
    await addStudent({ ...form, acertosAtuais: form.acertosIniciais });
    setForm({ nome: '', objetivo: '', acertosIniciais: 0, meta: 150 });
    setOpen(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-primary">ALUNOS</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-1" /> Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-primary">Adicionar Aluno</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome do aluno" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="bg-background border-border" />
              <Input placeholder="Objetivo (ex: Medicina)" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} className="bg-background border-border" />
              <Input type="number" placeholder="Acertos iniciais" value={form.acertosIniciais || ''} onChange={e => setForm({ ...form, acertosIniciais: Number(e.target.value) })} className="bg-background border-border" />
              <Input type="number" placeholder="Meta de acertos" value={form.meta || ''} onChange={e => setForm({ ...form, meta: Number(e.target.value) })} className="bg-background border-border" />
              <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground">Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {students.length === 0 && <p className="text-muted-foreground text-sm">Nenhum aluno cadastrado.</p>}
        {students.map(s => {
          const pct = s.meta > 0 ? Math.min(100, ((s.acertosAtuais - s.acertosIniciais) / (s.meta - s.acertosIniciais)) * 100) : 0;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStudent(s.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedStudentId === s.id ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{s.nome}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {s.objetivo}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Inicial: {s.acertosIniciais}</span>
                <span>Atual: {s.acertosAtuais}</span>
                <span>Meta: {s.meta}</span>
              </div>
              <Progress value={Math.max(0, pct)} className="mt-2 h-1.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
