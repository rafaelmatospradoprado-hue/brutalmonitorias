import React, { useState, useRef } from 'react';
import { getDuvidas, addDuvida, responderDuvida, getStudents } from '@/lib/store';
import { Duvida } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircleQuestion, Clock, CheckCircle2, Plus, ArrowLeft, ImagePlus, X } from 'lucide-react';

const DISCIPLINAS = [
  'Matemática', 'Física', 'Química', 'Biologia',
  'Português', 'Literatura', 'Redação',
  'História', 'Geografia', 'Filosofia', 'Sociologia',
  'Inglês', 'Espanhol'
];

function ImageUploadArea({ imageUrl, onImageChange, onRemove }: { imageUrl?: string; onImageChange: (url: string) => void; onRemove: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 12MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (imageUrl) {
    return (
      <div className="relative inline-block">
        <img src={imageUrl} alt="Anexo" className="max-h-40 rounded-lg border border-border object-contain" />
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/80 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer"
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-sm font-medium text-foreground">Adicionar imagem</span>
        <span className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou GIF (máx. 12MB)</span>
      </button>
    </div>
  );
}

export default function QuestoesSection() {
  const [view, setView] = useState<'list' | 'nova'>('list');
  const [duvidas, setDuvidas] = useState<Duvida[]>(getDuvidas());
  const [respostaAberta, setRespostaAberta] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState('');
  const [respostaImagem, setRespostaImagem] = useState<string | undefined>();

  // Form states
  const [titulo, setTitulo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [texto, setTexto] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [imagemUrl, setImagemUrl] = useState<string | undefined>();

  const students = getStudents();
  const pendentes = duvidas.filter(d => d.status === 'pendente').length;
  const respondidas = duvidas.filter(d => d.status === 'respondida').length;

  const handleSubmit = () => {
    if (!titulo.trim() || !disciplina || !texto.trim() || !alunoId) return;
    const aluno = students.find(s => s.id === alunoId);
    addDuvida({
      alunoId,
      nomeAluno: aluno?.nome || 'Aluno',
      titulo: titulo.trim(),
      disciplina,
      texto: texto.trim(),
      imagemUrl,
    });
    setDuvidas(getDuvidas());
    setTitulo(''); setDisciplina(''); setTexto(''); setAlunoId(''); setImagemUrl(undefined);
    setView('list');
  };

  const handleResponder = (id: string) => {
    if (!respostaTexto.trim() && !respostaImagem) return;
    responderDuvida(id, respostaTexto.trim(), respostaImagem);
    setDuvidas(getDuvidas());
    setRespostaAberta(null);
    setRespostaTexto('');
    setRespostaImagem(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-foreground">Questões & Dúvidas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie dúvidas dos alunos</p>
        </div>
        {view === 'list' ? (
          <Button onClick={() => setView('nova')} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Dúvida
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setView('list')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        )}
      </div>

      {view === 'list' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{duvidas.length}</p>
                  <p className="text-sm text-muted-foreground">Dúvidas enviadas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-orange-500/10 p-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendentes}</p>
                  <p className="text-sm text-muted-foreground">Dúvidas pendentes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-xl bg-green-500/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{respondidas}</p>
                  <p className="text-sm text-muted-foreground">Dúvidas respondidas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dúvidas List */}
          {duvidas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <MessageCircleQuestion className="h-12 w-12 mb-4 text-primary/30" />
                <p className="text-sm">Nenhuma dúvida enviada ainda</p>
                <Button variant="link" onClick={() => setView('nova')} className="mt-2">
                  Enviar primeira dúvida
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...duvidas].reverse().map(d => (
                <Card key={d.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant={d.status === 'pendente' ? 'secondary' : 'default'} className="text-xs">
                            {d.status === 'pendente' ? 'Pendente' : 'Respondida'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{d.disciplina}</Badge>
                          <span className="text-xs text-muted-foreground">{d.nomeAluno}</span>
                        </div>
                        <h3 className="font-semibold text-foreground">{d.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{d.texto}</p>

                        {d.imagemUrl && (
                          <img src={d.imagemUrl} alt="Anexo da dúvida" className="mt-3 max-h-60 rounded-lg border border-border object-contain" />
                        )}

                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(d.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>

                        {d.resposta && (
                          <div className="mt-3 p-3 rounded-lg bg-accent/50 border border-border">
                            <p className="text-xs font-medium text-primary mb-1">Resposta do mentor:</p>
                            <p className="text-sm text-foreground">{d.resposta}</p>
                            {d.respostaImagemUrl && (
                              <img src={d.respostaImagemUrl} alt="Anexo da resposta" className="mt-2 max-h-60 rounded-lg border border-border object-contain" />
                            )}
                          </div>
                        )}

                        {d.status === 'pendente' && respostaAberta === d.id && (
                          <div className="mt-3 space-y-3">
                            <Textarea
                              placeholder="Escreva sua resposta..."
                              value={respostaTexto}
                              onChange={e => setRespostaTexto(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <ImageUploadArea
                              imageUrl={respostaImagem}
                              onImageChange={setRespostaImagem}
                              onRemove={() => setRespostaImagem(undefined)}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleResponder(d.id)} disabled={!respostaTexto.trim() && !respostaImagem}>
                                Enviar Resposta
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setRespostaAberta(null); setRespostaTexto(''); setRespostaImagem(undefined); }}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {d.status === 'pendente' && respostaAberta !== d.id && (
                        <Button size="sm" variant="outline" onClick={() => { setRespostaAberta(d.id); setRespostaTexto(''); setRespostaImagem(undefined); }}>
                          Responder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        /* New Question Form */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nova Dúvida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Aluno</label>
              <Select value={alunoId} onValueChange={setAlunoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Título</label>
              <Input
                placeholder="Ex: Dúvida sobre logaritmos"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Disciplina</label>
              <Select value={disciplina} onValueChange={setDisciplina}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINAS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Sua dúvida</label>
              <Textarea
                placeholder="Descreva sua dúvida com o máximo de detalhes possível..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Anexos (opcional)</label>
              <ImageUploadArea
                imageUrl={imagemUrl}
                onImageChange={setImagemUrl}
                onRemove={() => setImagemUrl(undefined)}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full gap-2" disabled={!titulo.trim() || !disciplina || !texto.trim() || !alunoId}>
              <Plus className="h-4 w-4" /> Enviar Dúvida
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
