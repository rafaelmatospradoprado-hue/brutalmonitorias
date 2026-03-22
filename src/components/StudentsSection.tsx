import React, { useState, useEffect } from 'react';
import { Student } from '@/types';
import { getStudents, addStudent, updateStudent, deleteStudent } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, User, Loader2, Edit2, Trash2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  onSelectStudent: (id: string) => void;
  selectedStudentId: string | null;
}

export default function StudentsSection({ onSelectStudent, selectedStudentId }: Props) {
  const { role } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ nome: '', objetivo: '', acertosIniciais: 0, meta: 150, password: '' });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    if (!form.nome) return;
    try {
      await addStudent({ ...form, acertosAtuais: form.acertosIniciais });
      await refresh();
      resetForm();
      setOpen(false);
    } catch (err) {
      console.error('Erro ao adicionar aluno:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingStudent || !form.nome) return;
    try {
      await updateStudent(editingStudent.id, { 
        nome: form.nome, 
        objetivo: form.objetivo, 
        acertosIniciais: form.acertosIniciais, 
        meta: form.meta,
        password: form.password || undefined
      });
      await refresh();
      setEditingStudent(null);
      resetForm();
    } catch (err) {
      console.error('Erro ao atualizar aluno:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno? Todos os seus dados serão removidos.')) return;
    try {
      await deleteStudent(id);
      await refresh();
      if (selectedStudentId === id) onSelectStudent('');
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
    }
  };

  const resetForm = () => setForm({ nome: '', objetivo: '', acertosIniciais: 0, meta: 150, password: '' });

  const startEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ 
      nome: s.nome, 
      objetivo: s.objetivo, 
      acertosIniciais: s.acertosIniciais, 
      meta: s.meta, 
      password: s.password || '' 
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-primary">ALUNOS</h2>
        {role === 'admin' && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) resetForm(); }}>
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
                <Input placeholder="Senha de acesso" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-background border-border" />
                <Input type="number" placeholder="Acertos iniciais" value={form.acertosIniciais || ''} onChange={e => setForm({ ...form, acertosIniciais: Number(e.target.value) })} className="bg-background border-border" />
                <Input type="number" placeholder="Meta de acertos" value={form.meta || ''} onChange={e => setForm({ ...form, meta: Number(e.target.value) })} className="bg-background border-border" />
                <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground">Cadastrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {students.length === 0 && <p className="text-muted-foreground text-sm">Nenhum aluno cadastrado.</p>}
            {students.map(s => {
              const pct = s.meta > 0 ? Math.min(100, ((s.acertosAtuais - s.acertosIniciais) / (s.meta - s.acertosIniciais)) * 100) : 0;
              const isEditing = editingStudent?.id === s.id;

              return (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => onSelectStudent(s.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedStudentId === s.id ? 'border-primary bg-accent/40' : 'border-border bg-card hover:border-primary/40'
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
                  
                  {role === 'admin' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); startEdit(s); }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(v) => { if(!v) { setEditingStudent(null); resetForm(); } }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">Editar Aluno: {editingStudent?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Nome</label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Objetivo</label>
              <Input value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Senha</label>
              <Input placeholder="Deixe em branco para não alterar" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Acertos Iniciais</label>
                <Input type="number" value={form.acertosIniciais || ''} onChange={e => setForm({ ...form, acertosIniciais: Number(e.target.value) })} className="bg-background border-border" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block uppercase font-bold">Meta</label>
                <Input type="number" value={form.meta || ''} onChange={e => setForm({ ...form, meta: Number(e.target.value) })} className="bg-background border-border" />
              </div>
            </div>
            <Button onClick={handleUpdate} className="w-full bg-primary text-primary-foreground mt-2">Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
