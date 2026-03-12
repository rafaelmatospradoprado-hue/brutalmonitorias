import React, { useState, useEffect, useMemo } from 'react';
import { ProvaEnem } from '@/types';
import { getProvasEnem, addProvaEnem, addDuvida, getStudents } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp, AlertTriangle, BookOpen, PenLine, X, ExternalLink, RefreshCw, ImagePlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Props { alunoId: string; }

const TOTAL_QUESTOES = 180;
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

function ImageUploadInline({ imageUrl, onImageChange, onRemove }: { imageUrl?: string; onImageChange: (url: string) => void; onRemove: () => void }) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) { alert('Imagem muito grande. Máximo 12MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') onImageChange(reader.result); };
    reader.readAsDataURL(file);
  };
  if (imageUrl) {
    return (
      <div className="relative inline-block">
        <img src={imageUrl} alt="Anexo" className="max-h-32 rounded-lg border border-border object-contain" />
        <button onClick={onRemove} className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/80 transition-colors">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleFile} />
      <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer text-sm text-muted-foreground">
        <ImagePlus className="h-4 w-4" /> Anexar imagem
      </button>
    </div>
  );
}

export default function ProvasEnemSection({ alunoId }: Props) {
  const [provas, setProvas] = useState<ProvaEnem[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingRevisao, setEditingRevisao] = useState<string | null>(null);
  const [revisaoValue, setRevisaoValue] = useState(0);

  const [form, setForm] = useState({
    ano: 2024, linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
    dificuldadePercebida: 'Médio', dificuldadesEncontradas: '', correcaoLacunas: false,
    erroLacunaConteudo: 0, erroDesatencao: 0, erroBanal: 0, erroConteudoNaoEstudado: 0,
    conteudosComLacuna: '', questoesAjuda: '', questoesAjudaImagem: undefined as string | undefined
  });

  useEffect(() => { setProvas(getProvasEnem(alunoId)); }, [alunoId]);
  const reload = () => setProvas(getProvasEnem(alunoId));

  const resetForm = () => {
    setForm({
      ano: 2024, linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
      dificuldadePercebida: 'Médio', dificuldadesEncontradas: '', correcaoLacunas: false,
      erroLacunaConteudo: 0, erroDesatencao: 0, erroBanal: 0, erroConteudoNaoEstudado: 0,
      conteudosComLacuna: '', questoesAjuda: '', questoesAjudaImagem: undefined
    });
    setStep(1);
  };

  const totalAcertos = form.linguagens + form.humanas + form.natureza + form.matematica;
  const totalErros = Math.max(0, TOTAL_QUESTOES - totalAcertos);
  const somaErros = (form.erroLacunaConteudo || 0) + (form.erroDesatencao || 0) + (form.erroBanal || 0) + (form.erroConteudoNaoEstudado || 0);

  const handleSave = () => {
    addProvaEnem({
      alunoId,
      ano: form.ano,
      linguagens: form.linguagens, humanas: form.humanas, natureza: form.natureza, matematica: form.matematica,
      dificuldadePercebida: form.dificuldadePercebida,
      dificuldadesEncontradas: form.dificuldadesEncontradas,
      correcaoLacunas: form.correcaoLacunas,
      erroLacunaConteudo: form.erroLacunaConteudo,
      erroDesatencao: form.erroDesatencao,
      erroBanal: form.erroBanal,
      erroConteudoNaoEstudado: form.erroConteudoNaoEstudado,
      conteudosComLacuna: form.conteudosComLacuna,
      questoesAjuda: form.questoesAjuda,
      questoesAjudaImagem: form.questoesAjudaImagem
    });

    if (form.questoesAjuda.trim() || form.questoesAjudaImagem) {
      const student = getStudents().find(s => s.id === alunoId);
      addDuvida({
        alunoId, nomeAluno: student?.nome || 'Aluno',
        titulo: `Prova ENEM ${form.ano} – Dúvida`, disciplina: 'ENEM',
        texto: form.questoesAjuda.trim(),
        imagemUrl: form.questoesAjudaImagem
      });
    }

    reload(); resetForm(); setOpen(false);
  };

  const handleSaveRevisao = (id: string, newTotal: number) => {
    const existing = provas.find(p => p.id === id);
    if (!existing) return;
    
    // update is not explicitly typed for all properties in ProvasEnem as Simulado is, but we'll manually mutate and set
    const all = getProvasEnem(alunoId).filter(p => p.id !== id);
    const updated = { ...existing, acertosPosRevisao: revisaoValue };
    // This is a bit of a hack since updateProvaEnem doesn't exist, we replace the whole array manually
    const global_provas = [...JSON.parse(localStorage.getItem('brutal_provas') || '[]').filter((p: any) => p.id !== id), updated];
    localStorage.setItem('brutal_provas', JSON.stringify(global_provas));

    reload(); setEditingRevisao(null);
  };

  const radarData = useMemo(() => {
    const withAnalysis = provas.filter(s => s.erroLacunaConteudo !== undefined);
    if (withAnalysis.length === 0) return null;
    const totals = { lacuna: 0, desatencao: 0, banal: 0, naoEstudado: 0, totalErros: 0 };
    withAnalysis.forEach(s => {
      totals.lacuna += s.erroLacunaConteudo || 0;
      totals.desatencao += s.erroDesatencao || 0;
      totals.banal += s.erroBanal || 0;
      totals.naoEstudado += s.erroConteudoNaoEstudado || 0;
      totals.totalErros += (s.erroLacunaConteudo || 0) + (s.erroDesatencao || 0) + (s.erroBanal || 0) + (s.erroConteudoNaoEstudado || 0);
    });
    if (totals.totalErros === 0) return null;
    return [
      { tipo: 'Lacuna de conteúdo', valor: Math.round((totals.lacuna / totals.totalErros) * 100) },
      { tipo: 'Desatenção', valor: Math.round((totals.desatencao / totals.totalErros) * 100) },
      { tipo: 'Erro banal', valor: Math.round((totals.banal / totals.totalErros) * 100) },
      { tipo: 'Não estudado', valor: Math.round((totals.naoEstudado / totals.totalErros) * 100) },
    ];
  }, [provas]);

  const lacunasRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    provas.forEach(s => {
      if (s.conteudosComLacuna) {
        s.conteudosComLacuna.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean).forEach(l => {
          counts[l] = (counts[l] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [provas]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">PROVAS ENEM ANTIGAS</h2>
        <div className="flex gap-2">
           <a href="https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors">
            <ExternalLink className="h-3 w-3" /> Provas Oficiais
          </a>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Prova</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-primary">Registrar Prova ENEM</DialogTitle>
                <p className="text-xs text-muted-foreground">Etapa {step} de 4</p>
              </DialogHeader>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />)}
              </div>

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Informações e 1º Dia</p>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Ano da Prova</label>
                    <select value={form.ano} onChange={(e) => setForm({...form, ano: Number(e.target.value)})} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {anos.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Linguagens (acertos de 45)</label>
                    <Input type="number" min={0} max={45} value={form.linguagens || ''} onChange={e => setForm({ ...form, linguagens: Math.min(45, Number(e.target.value)) })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Humanas (acertos de 45)</label>
                    <Input type="number" min={0} max={45} value={form.humanas || ''} onChange={e => setForm({ ...form, humanas: Math.min(45, Number(e.target.value)) })} />
                  </div>
                  <Button onClick={() => setStep(2)} className="w-full">Próximo → 2º Dia</Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">2º Dia</p>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Natureza (acertos de 45)</label>
                    <Input type="number" min={0} max={45} value={form.natureza || ''} onChange={e => setForm({ ...form, natureza: Math.min(45, Number(e.target.value)) })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Matemática (acertos de 45)</label>
                    <Input type="number" min={0} max={45} value={form.matematica || ''} onChange={e => setForm({ ...form, matematica: Math.min(45, Number(e.target.value)) })} />
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <p className="text-xs text-muted-foreground">Total geral:</p>
                    <p className="font-display text-2xl text-primary">{totalAcertos} <span className="text-sm text-muted-foreground">acertos / {totalErros} erros</span></p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Voltar</Button>
                    <Button onClick={() => setStep(3)} className="flex-1">Próximo → Análise</Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Análise de Erros</p>
                  <p className="text-xs text-muted-foreground">Total de erros: <strong className="text-foreground">{totalErros}</strong>.</p>
                  <div><label className="text-xs mb-1 block">Lacuna de conteúdo</label><Input type="number" value={form.erroLacunaConteudo || ''} onChange={e => setForm({ ...form, erroLacunaConteudo: Number(e.target.value) })} /></div>
                  <div><label className="text-xs mb-1 block">Desatenção</label><Input type="number" value={form.erroDesatencao || ''} onChange={e => setForm({ ...form, erroDesatencao: Number(e.target.value) })} /></div>
                  <div><label className="text-xs mb-1 block">Erro banal</label><Input type="number" value={form.erroBanal || ''} onChange={e => setForm({ ...form, erroBanal: Number(e.target.value) })} /></div>
                  <div><label className="text-xs mb-1 block">Conteúdo não estudado</label><Input type="number" value={form.erroConteudoNaoEstudado || ''} onChange={e => setForm({ ...form, erroConteudoNaoEstudado: Number(e.target.value) })} /></div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Voltar</Button>
                    <Button onClick={() => setStep(4)} className="flex-1" disabled={somaErros !== totalErros}>Próximo → Lacunas ({somaErros}/{totalErros})</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Conteúdos & Finalização</p>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Conteúdos com lacuna (um por linha)</label>
                    <Textarea value={form.conteudosComLacuna} onChange={e => setForm({ ...form, conteudosComLacuna: e.target.value })} className="min-h-[80px]" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Dificuldades gerais</label>
                    <Textarea value={form.dificuldadesEncontradas} onChange={e => setForm({ ...form, dificuldadesEncontradas: e.target.value })} className="min-h-[50px]" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={form.correcaoLacunas} onChange={e => setForm({ ...form, correcaoLacunas: e.target.checked })} className="accent-primary" />
                    <label className="text-sm text-foreground">Correção realizada</label>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block mt-2">Questões que precisei de ajuda</label>
                    <Textarea 
                      value={form.questoesAjuda} 
                      onChange={e => setForm({ ...form, questoesAjuda: e.target.value })} 
                      className="min-h-[50px] text-sm" 
                      placeholder="Questão 46 – não entendi a interpretação..."
                    />
                    <div className="mt-2">
                       <ImageUploadInline
                        imageUrl={form.questoesAjudaImagem}
                        onImageChange={url => setForm({ ...form, questoesAjudaImagem: url })}
                        onRemove={() => setForm({ ...form, questoesAjudaImagem: undefined })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setStep(3)} className="flex-1">← Voltar</Button>
                    <Button onClick={handleSave} className="flex-1 bg-primary">Salvar Prova</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

       {/* Referência de dificuldade */}
       <div className="p-3 bg-card border border-border rounded-lg">
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

      {/* Analytics side by side */}
      {(radarData || lacunasRanking.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {radarData && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm text-muted-foreground uppercase tracking-wider">Radar de Erros nas Provas (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(155, 20%, 16%)" />
                    <PolarAngleAxis dataKey="tipo" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: 'hsl(43, 20%, 45%)', fontSize: 9 }} />
                    <Radar dataKey="valor" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {lacunasRanking.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> Tracking de Lacunas das Provas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {lacunasRanking.map(([conteudo, count], i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border">
                      <span className="text-sm text-foreground capitalize">{conteudo}</span>
                      <Badge variant="secondary" className="text-xs">{count}x</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Provas list */}
      <div className="space-y-3">
        {provas.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma prova registrada.</p>}
        {[...provas].sort((a,b) => b.ano - a.ano).map(s => {
          const total = s.linguagens + s.humanas + s.natureza + s.matematica;
          const erros = TOTAL_QUESTOES - total;
          const dia1 = s.linguagens + s.humanas;
          const dia2 = s.natureza + s.matematica;
          const isExpanded = expanded === s.id;
          const ganho = s.acertosPosRevisao !== undefined ? s.acertosPosRevisao - total : null;
          const ref = dificuldadeReferencia[s.ano];

          return (
            <div key={s.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-foreground text-lg">ENEM {s.ano}</span>
                    {ref > 0 && <span className={`text-xs ${getDiffColor(ref)}`}>(dif. {ref})</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-display text-xl text-primary">{total}</span>
                      <span className="text-xs text-muted-foreground ml-1">acertos</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Linguagens', val: s.linguagens }, { label: 'Humanas', val: s.humanas },
                      { label: 'Natureza', val: s.natureza }, { label: 'Matemática', val: s.matematica },
                    ].map(a => (
                      <div key={a.label} className="text-center p-2 bg-background rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">{a.label}</p>
                        <p className="font-display text-lg text-foreground">{a.val}<span className="text-xs text-muted-foreground">/45</span></p>
                      </div>
                    ))}
                  </div>

                  {s.erroLacunaConteudo !== undefined && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-2">
                      {[
                        { label: 'Lacuna', val: s.erroLacunaConteudo }, { label: 'Desatenção', val: s.erroDesatencao },
                        { label: 'Erro banal', val: s.erroBanal }, { label: 'Não estudado', val: s.erroConteudoNaoEstudado },
                      ].map(e => (
                        <div key={e.label} className="p-2 bg-background rounded border border-border text-center">
                          <p className="text-muted-foreground">{e.label}</p>
                          <p className="text-foreground font-medium">{e.val ?? 0}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.conteudosComLacuna && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Conteúdos com lacuna:</p>
                      <div className="flex flex-wrap gap-1">
                        {s.conteudosComLacuna.split('\n').filter(Boolean).map((l, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{l.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questões ajuda */}
                  {(s.questoesAjuda || s.questoesAjudaImagem) && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Questões que precisou de ajuda:</p>
                      {s.questoesAjuda && <p className="text-sm text-foreground">{s.questoesAjuda}</p>}
                      {s.questoesAjudaImagem && (
                        <img src={s.questoesAjudaImagem} alt="Questão" className="mt-2 max-h-48 rounded-lg border border-border object-contain" />
                      )}
                    </div>
                  )}

                  {/* Revisão Tracking */}
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Revisão e Refeitura</p>
                        {s.acertosPosRevisao !== undefined ? (
                          <div className="mt-1">
                            <span className="text-sm text-foreground">Resultado bruto: <strong>{total}</strong></span>
                            <span className="text-sm text-foreground ml-3">Após refazer: <strong className="text-primary">{s.acertosPosRevisao}</strong></span>
                            <span className={`text-sm ml-3 font-medium ${ganho! >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                              Ganho real: {ganho! >= 0 ? '+' : ''}{ganho}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Status: Esperando você refazer a prova.</p>
                        )}
                      </div>
                      {editingRevisao !== s.id && (
                        <Button size="sm" variant="outline" onClick={() => { setEditingRevisao(s.id); setRevisaoValue(s.acertosPosRevisao ?? total); }}>
                          {s.acertosPosRevisao !== undefined ? 'Editar' : 'Registrar Refeitura'}
                        </Button>
                      )}
                    </div>
                    {editingRevisao === s.id && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input type="number" min={0} max={180} value={revisaoValue} onChange={e => setRevisaoValue(Number(e.target.value))} className="bg-card border-border w-28" />
                        <span className="text-xs text-muted-foreground">acertos finais pós revisão</span>
                        <Button size="sm" onClick={() => handleSaveRevisao(s.id, revisaoValue)}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingRevisao(null)}>Cancelar</Button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
