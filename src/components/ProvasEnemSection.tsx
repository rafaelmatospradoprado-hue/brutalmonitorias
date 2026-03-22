import React, { useState, useEffect, useMemo } from 'react';
import { ProvaEnem } from '@/types';
import { getProvasEnem, addProvaEnem, addDuvida, getStudents, getTABRecords, addTABRecord, updateTABRecord, deleteTABRecord, updateProvaEnem } from '@/lib/store';
import { TABRecord, TABQuestion } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp, AlertTriangle, BookOpen, PenLine, X, ExternalLink, RefreshCw, ImagePlus, BarChart3, AlertCircle, Target, CheckCircle2, PlayCircle, Award, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props { alunoId: string; }

const TOTAL_QUESTOES = 180;
const anos = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
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
  const [refresh, setRefresh] = useState(0);
  const [tabRecords, setTabRecords] = useState<TABRecord[]>([]);
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<TABRecord | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingRevisao, setEditingRevisao] = useState<string | null>(null);
  const [revisaoValue, setRevisaoValue] = useState(0);

  const [form, setForm] = useState({
    ano: 2024, linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
    dificuldadePercebida: 'Médio', dificuldadesEncontradas: '', correcaoLacunas: false,
    erroLacunaConteudo: 0, erroDesatencao: 0, erroBanal: 0, erroConteudoNaoEstudado: 0,
    conteudosComLacuna: '', questoesAjuda: '', questoesAjudaImagem: undefined as string | undefined
  });

  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const p = await getProvasEnem(alunoId);
      const t = await getTABRecords(alunoId);
      setProvas(p);
      setTabRecords(t);
    } catch (err) {
      console.error('Erro ao recarregar provas/TAB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [alunoId]);

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

  const handleSave = async () => {
    await addProvaEnem({
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
      const students = await getStudents();
      const student = students.find(s => s.id === alunoId);
      await addDuvida({
        alunoId, nomeAluno: student?.nome || 'Aluno',
        titulo: `Prova ENEM ${form.ano} – Dúvida`, disciplina: 'ENEM',
        texto: form.questoesAjuda.trim(),
        imagemUrl: form.questoesAjudaImagem
      });
    }

    await reload(); resetForm(); setOpen(false);
  };

  const handleUpdate = async (id: string, updates: Partial<ProvaEnem>) => {
    await updateProvaEnem(id, updates);
    await reload();
  };

  const handleSaveRevisao = async (id: string, newTotal: number) => {
    await handleUpdate(id, { acertosPosRevisao: revisaoValue });
    setEditingRevisao(null);
  };

  // Evolution data 2.0 (Real vs Projected)
  const student = useMemo(() => getStudents().find(s => s.id === alunoId), [alunoId]);
  const evolucaoData = useMemo(() => {
    const metaTotal = student?.meta || 0;
    return anos.map(ano => {
      const anoProvas = provas.filter(p => p.ano === ano);
      const anoTabs = tabRecords.filter(r => r.provaAno === ano);
      
      let real = 0;
      let totalErrTab = 0;
      
      if (anoProvas.length > 0) {
        const item = anoProvas[0];
        real = item.linguagens + item.humanas + item.natureza + item.matematica;
        const avoidable = (item.erroLacunaConteudo || 0) + (item.erroDesatencao || 0) + (item.erroBanal || 0);
        
        // Count errors in TAB for this year as avoidable too
        anoTabs.forEach(record => {
          totalErrTab += record.questoes.filter(q => q.status === 'erro').length;
        });

        return {
          name: `ENEM ${ano}`,
          real,
          projetado: Math.min(180, real + avoidable + totalErrTab),
          meta: metaTotal
        };
      }
      return null;
    }).filter(Boolean);
  }, [provas, tabRecords, student]);

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

  const handleStartTAB = async (ano: number, bloco: number) => {
    const questoes: TABQuestion[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      numeroOriginal: (bloco - 1) * 15 + (i + 1),
      status: 'pendente'
    }));
    await addTABRecord({
      alunoId,
      provaAno: ano,
      bloco,
      questoes
    });
    await reload();
    setNewTabOpen(false);
  };

  const handleUpdateQuestion = async (recordId: string, qId: number, updates: Partial<TABQuestion>) => {
    const record = tabRecords.find(r => r.id === recordId);
    if (!record) return;
    const newQuestoes = record.questoes.map(q => q.id === qId ? { ...q, ...updates } : q);
    await updateTABRecord(recordId, { questoes: newQuestoes });
    await reload();
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6" /> PROVAS E LACUNAS
        </h2>
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
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="tab" className="w-full">
        <TabsList className="bg-card border border-border w-full justify-start p-1 h-12">
          <TabsTrigger value="historico" className="flex-1 lg:flex-none flex items-center gap-2 data-[state=active]:bg-primary h-full">
            <Award className="h-4 w-4" /> Histórico de Provas
          </TabsTrigger>
          <TabsTrigger value="tab" className="flex-1 lg:flex-none flex items-center gap-2 data-[state=active]:bg-primary h-full">
            <Target className="h-4 w-4" /> Mapa de Lacunas (TAB)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-6 mt-6">
          {/* Provas Evolution Chart 2.0 */}
          {evolucaoData.length >= 1 && (
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="pb-2 pt-5 bg-muted/20">
                <CardTitle className="font-display text-sm text-primary uppercase tracking-tight flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2 px-1">
                    <BarChart3 className="h-4 w-4" /> PERFORMANCE EM PROVAS ENEM: REAL VS PROJETADO
                  </span>
                  <div className="flex items-center gap-4 text-[11px] normal-case font-sans tracking-normal bg-background/50 px-3 py-1 rounded-full border border-border/50">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Real</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Projetado</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" /> Meta</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-6">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={evolucaoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 20%, 16%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
                    <YAxis domain={[0, 180]} tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ background: 'hsl(155, 30%, 7%)', border: '1px solid hsl(155, 20%, 16%)', borderRadius: 8, fontSize: '12px' }}
                      labelStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                    <Line name="Pontuação Real" type="monotone" dataKey="real" stroke="hsl(43, 76%, 52%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line name="Com Correção de Lacunas" type="monotone" dataKey="projetado" stroke="hsl(150, 100%, 50%)" strokeWidth={2} strokeDasharray="5 5" />
                    <Line name="Meta de Acertos" type="monotone" dataKey="meta" stroke="hsl(0, 100%, 50%)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

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

          <div className="space-y-3">
            {provas.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma prova registrada.</p>}
            {[...provas].sort((a,b) => b.ano - a.ano).map(s => {
              const total = s.linguagens + s.humanas + s.natureza + s.matematica;
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
                        <div className="flex items-center gap-2 mr-2 px-2 py-1 bg-background border border-border rounded text-[10px]">
                          <span className={s.correcaoLacunas ? "text-emerald-400 font-bold" : "text-yellow-500 font-bold"}>
                            {s.correcaoLacunas ? "LACUNAS OK" : "LACUNAS PENDENTES"}
                          </span>
                          <input 
                            type="checkbox" 
                            checked={s.correcaoLacunas} 
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdate(s.id, { correcaoLacunas: e.target.checked });
                            }}
                            className="accent-primary h-3 w-3"
                          />
                        </div>
                        <div className="text-right">
                          <span className="font-display text-xl text-primary">{total}</span>
                          <span className="text-xs text-muted-foreground ml-1">acertos</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4 animate-slide-down">
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

                      {(s.questoesAjuda || s.questoesAjudaImagem) && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Questões que precisou de ajuda:</p>
                          {s.questoesAjuda && <p className="text-sm text-foreground">{s.questoesAjuda}</p>}
                          {s.questoesAjudaImagem && (
                            <img src={s.questoesAjudaImagem} alt="Questão" className="mt-2 max-h-48 rounded-lg border border-border object-contain" />
                          )}
                        </div>
                      )}

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
        </TabsContent>

        <TabsContent value="tab" className="space-y-6 mt-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg text-primary uppercase">Mapa de Lacunas (Modelo TAB)</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Acompanhamento granular de 15 em 15 questões (Provas Antigas).
                </p>
              </div>
              <Dialog open={newTabOpen} onOpenChange={setNewTabOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Bloco TAB</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Iniciar Novo Bloco TAB</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Ano da Prova</label>
                      <Select value={form.ano.toString()} onValueChange={v => setForm({...form, ano: Number(v)})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{anos.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Bloco de Questões</label>
                      <Select defaultValue="1" onValueChange={v => setForm({...form, linguagens: Number(v)})}> {/* reuse field for block */}
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => (
                            <SelectItem key={i+1} value={(i+1).toString()}>Bloco {i+1} (Q. {i*15+1} - {(i+1)*15})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => handleStartTAB(form.ano, form.linguagens || 1)}>Iniciar Acompanhamento</Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tabRecords.length === 0 && (
                  <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-border">
                    <p className="text-sm text-muted-foreground italic">Nenhum bloco TAB iniciado.</p>
                    <p className="text-[10px] text-muted-foreground mt-1 px-10">O modelo TAB ajuda a identificar lacunas específicas ao analisar blocos curtos de 15 questões.</p>
                  </div>
                )}
                {tabRecords.slice().reverse().map(record => (
                  <Card key={record.id} className="bg-background/50 border-border overflow-hidden">
                    <CardHeader className="p-3 bg-muted/30 flex flex-row items-center justify-between border-b border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">ENEM {record.provaAno}</Badge>
                        <span className="font-display text-sm">Bloco {record.bloco}</span>
                        <span className="text-[10px] text-muted-foreground">Q. {(record.bloco-1)*15+1} a {record.bloco*15}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteTABRecord(record.id)} className="h-6 w-6 text-destructive hover:bg-destructive/10"><X className="h-3 w-3" /></Button>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-5 md:grid-cols-15 gap-2">
                        {record.questoes.map(q => {
                          const isCorrected = q.status === 'erro' && (
                            (q.tipoErro === 'lacuna' && q.gabaritoOk && q.escritaOk && q.videoOk) ||
                            (q.tipoErro === 'desconhecimento' && q.estudoOk) ||
                            (q.tipoErro === 'desatencao' && q.status === 'erro')
                          );
                          
                          return (
                            <div key={q.id} className="flex flex-col items-center gap-1 relative">
                              <button 
                                onClick={() => {
                                  const nextStatus = q.status === 'pendente' ? 'acerto' : q.status === 'acerto' ? 'erro' : 'pendente';
                                  handleUpdateQuestion(record.id, q.id, { 
                                    status: nextStatus as any, 
                                    tipoErro: nextStatus === 'erro' ? (q.tipoErro || 'lacuna') : undefined 
                                  });
                                }}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all transform hover:scale-105 active:scale-95 ${
                                  q.status === 'acerto' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                  q.status === 'erro' ? (isCorrected ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-destructive/10 border-destructive/40 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.1)]') :
                                  'bg-muted/50 border-border/50 text-muted-foreground hover:border-primary/30'
                                }`}
                              >
                                {q.numeroOriginal}
                                {isCorrected && (
                                  <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 shadow-sm">
                                    <CheckCircle2 className="h-2 w-2 text-white" />
                                  </div>
                                )}
                              </button>
                              {q.status === 'erro' && (
                                <Select 
                                  value={q.tipoErro} 
                                  onValueChange={v => handleUpdateQuestion(record.id, q.id, { tipoErro: v as any })}
                                >
                                  <SelectTrigger className="h-4 w-8 p-0 border-none bg-transparent focus:ring-0">
                                    <div className={`text-[8px] uppercase font-bold text-center w-full ${
                                      q.tipoErro === 'lacuna' ? 'text-yellow-500' :
                                      q.tipoErro === 'desconhecimento' ? 'text-blue-400' : 'text-foreground/50'
                                    }`}>
                                      {q.tipoErro === 'lacuna' ? 'LAC' : q.tipoErro === 'desconhecimento' ? 'DESC' : 'ATEN'}
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="desatencao">Desatenção</SelectItem>
                                    <SelectItem value="lacuna">Lacuna (Filtro A)</SelectItem>
                                    <SelectItem value="desconhecimento">Desconhecimento (Filtro B)</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Filters Section */}
                      <div className="mt-6 space-y-4">
                        {record.questoes.filter(q => q.status === 'erro' && q.tipoErro !== 'desatencao').map(q => (
                          <div key={q.id} className="p-3 bg-muted/20 rounded-lg border border-border flex flex-col md:flex-row gap-4">
                            <div className="min-w-[120px]">
                              <p className="text-xs font-bold text-primary">QUESTÃO {q.numeroOriginal}</p>
                              <Badge className={`mt-1 text-[9px] ${q.tipoErro === 'lacuna' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
                                {q.tipoErro === 'lacuna' ? 'FILTRO A: LACUNA' : 'FILTRO B: DESCONHECIMENTO'}
                              </Badge>
                            </div>

                            {q.tipoErro === 'lacuna' ? (
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
                                  <Checkbox checked={q.gabaritoOk} onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { gabaritoOk: !!v })} />
                                  <span className="text-[10px] leading-tight">1. Refazer com Gabarito</span>
                                </div>
                                <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
                                  <Checkbox checked={q.escritaOk} onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { escritaOk: !!v })} />
                                  <div className="flex flex-col">
                                    <span className="text-[10px] leading-tight">2. Correção Escrita</span>
                                    <a href="https://plataformaassaad.com.br/blog/enem-2025/" target="_blank" rel="noopener noreferrer" className="text-[8px] text-primary hover:underline flex items-center gap-0.5 mt-0.5">
                                      Blog Assaad <ExternalLink className="h-2 w-2" />
                                    </a>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-background/50 p-2 rounded border border-border/50">
                                  <Checkbox checked={q.videoOk} onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { videoOk: !!v })} />
                                  <span className="text-[10px] leading-tight">3. Explicação em Vídeo</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <div className="flex items-center gap-3 bg-blue-500/5 p-3 rounded-lg border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                                  <Checkbox 
                                    className="border-blue-500/50 data-[state=checked]:bg-blue-500" 
                                    checked={q.estudoOk} 
                                    onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { estudoOk: !!v })} 
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-blue-300">Ação Necessária: Revisar Teoria</span>
                                    <span className="text-[10px] text-muted-foreground leading-tight">Este conteúdo ainda não foi dominado. Volte aos seus materiais e re-estude.</span>
                                    <Button size="xs" variant="outline" className="mt-2 text-[10px] h-7 w-fit border-blue-500/30 hover:bg-blue-500/20 text-blue-300 flex items-center gap-1.5 uppercase font-display tracking-wider">
                                      <PlayCircle className="h-3.5 w-3.5" /> Assistir Aula
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Referência de dificuldade - MOVED TO BOTTOM */}
      <div className="p-4 bg-card border border-border rounded-lg shadow-inner">
        <h3 className="font-display text-[10px] text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
          <AlertCircle className="h-3 w-3" /> Dashboard de Referência: Dificuldade das Provas
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2 text-[10px]">
          {anos.filter(a => dificuldadeReferencia[a] > 0).sort((a, b) => b - a).map(a => (
            <div key={a} className="flex flex-col items-center gap-1 bg-background/30 p-2 rounded border border-border/20">
              <span className="text-muted-foreground font-mono">{a}</span>
              <span className={`font-display text-sm ${getDiffColor(dificuldadeReferencia[a])}`}>{dificuldadeReferencia[a].toFixed(1)}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground mt-4 italic text-right">
          * Valores aproximados baseados na média de acertos histórica. Use como parâmetro para projetar sua meta.
        </p>
      </div>
    </>
  )}
</div>
);
}
