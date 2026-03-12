import React, { useState, useMemo, useRef } from 'react';
import { Simulado } from '@/types';
import { useSimulados, useDuvidas, fetchStudentName } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp, AlertTriangle, BarChart3, BookOpen, PenLine, ImagePlus, X, ExternalLink, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface Props { alunoId: string; }

const TOTAL_QUESTOES = 180;

function ImageUploadInline({ imageUrl, onImageChange, onRemove }: { imageUrl?: string; onImageChange: (url: string) => void; onRemove: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
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
        <button onClick={onRemove} className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/80 transition-colors"><X className="h-3 w-3" /></button>
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

export default function SimuladosSection({ alunoId }: Props) {
  const { simulados, addSimulado, updateSimulado } = useSimulados(alunoId);
  const { addDuvida } = useDuvidas();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingRevisao, setEditingRevisao] = useState<string | null>(null);
  const [revisaoValue, setRevisaoValue] = useState(0);

  const [form, setForm] = useState({
    ano: new Date().getFullYear(), data: '',
    linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
    erroLacunaConteudo: 0, erroDesatencao: 0, erroBanal: 0, erroConteudoNaoEstudado: 0,
    conteudosComLacuna: '', questoesAjuda: '', questoesAjudaImagem: undefined as string | undefined,
  });

  const resetForm = () => {
    setForm({
      ano: new Date().getFullYear(), data: '',
      linguagens: 0, humanas: 0, natureza: 0, matematica: 0,
      erroLacunaConteudo: 0, erroDesatencao: 0, erroBanal: 0, erroConteudoNaoEstudado: 0,
      conteudosComLacuna: '', questoesAjuda: '', questoesAjudaImagem: undefined,
    });
    setStep(1);
  };

  const totalAcertos = form.linguagens + form.humanas + form.natureza + form.matematica;
  const totalErros = TOTAL_QUESTOES - totalAcertos;
  const acertosDia1 = form.linguagens + form.humanas;
  const acertosDia2 = form.natureza + form.matematica;
  const somaErros = form.erroLacunaConteudo + form.erroDesatencao + form.erroBanal + form.erroConteudoNaoEstudado;

  const handleSave = async () => {
    const numero = simulados.length + 1;
    await addSimulado({
      alunoId, numero, data: form.data, origem: `ENEM ${form.ano} – Versão Azul`,
      linguagens: form.linguagens, humanas: form.humanas, natureza: form.natureza, matematica: form.matematica,
      dificuldadePercebida: '', dificuldadesEncontradas: '', correcaoLacunas: false,
      erroLacunaConteudo: form.erroLacunaConteudo, erroDesatencao: form.erroDesatencao,
      erroBanal: form.erroBanal, erroConteudoNaoEstudado: form.erroConteudoNaoEstudado,
      conteudosComLacuna: form.conteudosComLacuna, questoesAjuda: form.questoesAjuda,
      questoesAjudaImagem: form.questoesAjudaImagem,
    });

    if (form.questoesAjuda.trim()) {
      const nome = await fetchStudentName(alunoId);
      await addDuvida({
        alunoId, nomeAluno: nome,
        titulo: `Simulado ENEM ${form.ano} – Dúvida`, disciplina: 'ENEM',
        texto: form.questoesAjuda.trim(), imagemUrl: form.questoesAjudaImagem,
      });
    }

    resetForm();
    setOpen(false);
  };

  const handleSaveRevisao = async (id: string) => {
    await updateSimulado(id, { acertosPosRevisao: revisaoValue });
    setEditingRevisao(null);
  };

  const radarData = useMemo(() => {
    const withAnalysis = simulados.filter(s => s.erroLacunaConteudo !== undefined);
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
  }, [simulados]);

  const lacunasRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    simulados.forEach(s => {
      if (s.conteudosComLacuna) {
        s.conteudosComLacuna.split('\n').map(l => l.trim().toLowerCase()).filter(Boolean).forEach(l => { counts[l] = (counts[l] || 0) + 1; });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [simulados]);

  const evolucaoData = useMemo(() => {
    return simulados.map(s => ({
      nome: s.origem || `Sim #${s.numero}`,
      acertos: s.linguagens + s.humanas + s.natureza + s.matematica,
      posRevisao: s.acertosPosRevisao ?? null,
    }));
  }, [simulados]);

  const ganhoMedio = useMemo(() => {
    const withRevisao = simulados.filter(s => s.acertosPosRevisao !== undefined);
    if (withRevisao.length === 0) return null;
    const ganhos = withRevisao.map(s => (s.acertosPosRevisao || 0) - (s.linguagens + s.humanas + s.natureza + s.matematica));
    return Math.round(ganhos.reduce((a, b) => a + b, 0) / ganhos.length);
  }, [simulados]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">Para manter a mesma numeração de questões para todos os alunos, <strong className="text-primary">todos os simulados devem ser registrados usando a versão azul da prova do ENEM.</strong></p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-primary">SIMULADOS ENEM</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-1" /> Novo Simulado</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-primary">Registrar Simulado ENEM</DialogTitle>
              <p className="text-xs text-muted-foreground">Etapa {step} de 4</p>
            </DialogHeader>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />)}
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">1º Dia – Linguagens e Humanas</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs text-muted-foreground mb-1 block">Ano da Prova</label><Input type="number" value={form.ano} onChange={e => setForm({ ...form, ano: Number(e.target.value) })} className="bg-background border-border" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block">Data da realização</label><Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="bg-background border-border" /></div>
                </div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Linguagens (acertos de 45)</label><Input type="number" min={0} max={45} value={form.linguagens || ''} onChange={e => setForm({ ...form, linguagens: Math.min(45, Number(e.target.value)) })} className="bg-background border-border" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Humanas (acertos de 45)</label><Input type="number" min={0} max={45} value={form.humanas || ''} onChange={e => setForm({ ...form, humanas: Math.min(45, Number(e.target.value)) })} className="bg-background border-border" /></div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Acertos 1º dia:</p>
                  <p className="font-display text-xl text-primary">{acertosDia1} <span className="text-xs text-muted-foreground">/ 90</span></p>
                </div>
                <Button onClick={() => setStep(2)} className="w-full">Próximo → 2º Dia</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">2º Dia – Natureza e Matemática</p>
                <div><label className="text-xs text-muted-foreground mb-1 block">Natureza (acertos de 45)</label><Input type="number" min={0} max={45} value={form.natureza || ''} onChange={e => setForm({ ...form, natureza: Math.min(45, Number(e.target.value)) })} className="bg-background border-border" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Matemática (acertos de 45)</label><Input type="number" min={0} max={45} value={form.matematica || ''} onChange={e => setForm({ ...form, matematica: Math.min(45, Number(e.target.value)) })} className="bg-background border-border" /></div>
                <div className="p-3 bg-background rounded-lg border border-border"><p className="text-xs text-muted-foreground">Acertos 2º dia:</p><p className="font-display text-xl text-primary">{acertosDia2} <span className="text-xs text-muted-foreground">/ 90</span></p></div>
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30"><p className="text-xs text-muted-foreground">Total geral:</p><p className="font-display text-2xl text-primary">{totalAcertos} <span className="text-sm text-muted-foreground">acertos / {totalErros} erros</span></p></div>
                <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Voltar</Button><Button onClick={() => setStep(3)} className="flex-1">Próximo → Análise</Button></div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Análise de Erros</p>
                <p className="text-xs text-muted-foreground">Total de erros: <strong className="text-foreground">{totalErros}</strong>. Distribua entre as categorias abaixo.</p>
                <div><label className="text-xs text-muted-foreground mb-1 block">Lacuna de conteúdo</label><Input type="number" min={0} value={form.erroLacunaConteudo || ''} onChange={e => setForm({ ...form, erroLacunaConteudo: Number(e.target.value) })} className="bg-background border-border" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Desatenção</label><Input type="number" min={0} value={form.erroDesatencao || ''} onChange={e => setForm({ ...form, erroDesatencao: Number(e.target.value) })} className="bg-background border-border" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Erro banal</label><Input type="number" min={0} value={form.erroBanal || ''} onChange={e => setForm({ ...form, erroBanal: Number(e.target.value) })} className="bg-background border-border" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Conteúdo não estudado</label><Input type="number" min={0} value={form.erroConteudoNaoEstudado || ''} onChange={e => setForm({ ...form, erroConteudoNaoEstudado: Number(e.target.value) })} className="bg-background border-border" /></div>
                <div className={`p-3 rounded-lg border ${somaErros === totalErros ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
                  <p className="text-xs text-muted-foreground">Soma dos erros classificados: <strong className={somaErros === totalErros ? 'text-emerald-400' : 'text-destructive'}>{somaErros}/{totalErros}</strong></p>
                  {somaErros !== totalErros && <p className="text-xs text-destructive mt-1">A soma deve ser igual ao total de erros ({totalErros})</p>}
                </div>
                <div className="flex gap-2"><Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Voltar</Button><Button onClick={() => setStep(4)} className="flex-1" disabled={somaErros !== totalErros}>Próximo → Lacunas</Button></div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Conteúdos com Lacuna & Dúvidas</p>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Conteúdos onde percebeu lacuna de conhecimento</label>
                  <p className="text-xs text-muted-foreground mb-2 italic">Um por linha. Ex: logaritmo, geometria analítica, óptica</p>
                  <Textarea value={form.conteudosComLacuna} onChange={e => setForm({ ...form, conteudosComLacuna: e.target.value })} className="bg-background border-border min-h-[80px] text-sm" placeholder={"logaritmo\ngeometria analítica\nóptica"} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Questões que precisei de ajuda</label>
                  <Textarea value={form.questoesAjuda} onChange={e => setForm({ ...form, questoesAjuda: e.target.value })} className="bg-background border-border min-h-[60px] text-sm" placeholder="Questão 46 – não entendi a interpretação..." />
                  <div className="mt-2">
                    <ImageUploadInline imageUrl={form.questoesAjudaImagem} onImageChange={url => setForm({ ...form, questoesAjudaImagem: url })} onRemove={() => setForm({ ...form, questoesAjudaImagem: undefined })} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> As dúvidas serão enviadas automaticamente para a Central de Questões.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">← Voltar</Button>
                  <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground">Salvar Simulado</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {simulados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Simulados</p><p className="font-display text-2xl text-foreground">{simulados.length}</p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Último resultado</p><p className="font-display text-2xl text-primary">{simulados.length > 0 ? simulados[simulados.length - 1].linguagens + simulados[simulados.length - 1].humanas + simulados[simulados.length - 1].natureza + simulados[simulados.length - 1].matematica : 0}</p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Melhor resultado</p><p className="font-display text-2xl text-emerald-400">{Math.max(...simulados.map(s => s.linguagens + s.humanas + s.natureza + s.matematica))}</p></CardContent></Card>
          {ganhoMedio !== null && (<Card className="bg-card border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ganho médio revisão</p><p className={`font-display text-2xl ${ganhoMedio >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>+{ganhoMedio}</p></CardContent></Card>)}
        </div>
      )}

      {evolucaoData.length >= 2 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="font-display text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Evolução de Acertos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={evolucaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 20%, 16%)" />
                <XAxis dataKey="nome" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(155, 30%, 7%)', border: '1px solid hsl(155, 20%, 16%)', borderRadius: 8, color: 'hsl(43, 60%, 85%)' }} />
                <Line type="monotone" dataKey="acertos" stroke="hsl(43, 76%, 52%)" strokeWidth={2} name="Acertos" dot={{ fill: 'hsl(43, 76%, 52%)', r: 4 }} />
                <Line type="monotone" dataKey="posRevisao" stroke="hsl(155, 50%, 50%)" strokeWidth={2} strokeDasharray="5 5" name="Pós-revisão" dot={{ fill: 'hsl(155, 50%, 50%)', r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {(radarData || lacunasRanking.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {radarData && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="font-display text-sm text-muted-foreground uppercase tracking-wider">Radar de Erros (%)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(155, 20%, 16%)" />
                    <PolarAngleAxis dataKey="tipo" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fill: 'hsl(43, 20%, 45%)', fontSize: 9 }} />
                    <Radar dataKey="valor" stroke="hsl(43, 76%, 52%)" fill="hsl(43, 76%, 52%)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {lacunasRanking.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2"><CardTitle className="font-display text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Ranking de Lacunas</CardTitle></CardHeader>
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
        {simulados.length === 0 && <p className="text-muted-foreground text-sm">Nenhum simulado registrado.</p>}
        {[...simulados].reverse().map(s => {
          const total = s.linguagens + s.humanas + s.natureza + s.matematica;
          const erros = TOTAL_QUESTOES - total;
          const dia1 = s.linguagens + s.humanas;
          const dia2 = s.natureza + s.matematica;
          const isExpanded = expanded === s.id;
          const ganho = s.acertosPosRevisao !== undefined ? s.acertosPosRevisao - total : null;
          return (
            <div key={s.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : s.id)}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3"><div><span className="font-display text-foreground">{s.origem || `Simulado #${s.numero}`}</span><span className="text-xs text-muted-foreground ml-2">{s.data}</span></div></div>
                  <div className="flex items-center gap-3"><div className="text-right"><span className="font-display text-xl text-primary">{total}</span><span className="text-xs text-muted-foreground ml-1">acertos</span></div>{isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mt-2">
                  <span>1º dia: <strong className="text-foreground">{dia1}/90</strong></span>
                  <span>2º dia: <strong className="text-foreground">{dia2}/90</strong></span>
                  <span>Total: <strong className="text-foreground">{total}/180</strong></span>
                  <span>Erros: <strong className="text-foreground">{erros}</strong></span>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {[{ label: 'Linguagens', val: s.linguagens }, { label: 'Humanas', val: s.humanas }, { label: 'Natureza', val: s.natureza }, { label: 'Matemática', val: s.matematica }].map(a => (
                      <div key={a.label} className="text-center p-2 bg-background rounded-lg border border-border"><p className="text-xs text-muted-foreground">{a.label}</p><p className="font-display text-lg text-foreground">{a.val}<span className="text-xs text-muted-foreground">/45</span></p></div>
                    ))}
                  </div>
                  {s.erroLacunaConteudo !== undefined && (
                    <div><p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><PenLine className="h-3 w-3" /> Análise de Erros</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {[{ label: 'Lacuna de conteúdo', val: s.erroLacunaConteudo }, { label: 'Desatenção', val: s.erroDesatencao }, { label: 'Erro banal', val: s.erroBanal }, { label: 'Não estudado', val: s.erroConteudoNaoEstudado }].map(e => (
                          <div key={e.label} className="p-2 bg-background rounded border border-border"><p className="text-muted-foreground">{e.label}</p><p className="text-foreground font-medium">{e.val ?? 0}</p></div>
                        ))}
                      </div>
                    </div>
                  )}
                  {s.conteudosComLacuna && (<div><p className="text-xs font-medium text-muted-foreground mb-1">Conteúdos com lacuna:</p><div className="flex flex-wrap gap-1">{s.conteudosComLacuna.split('\n').filter(Boolean).map((l, i) => <Badge key={i} variant="outline" className="text-xs">{l.trim()}</Badge>)}</div></div>)}
                  {s.questoesAjuda && (<div><p className="text-xs font-medium text-muted-foreground mb-1">Questões que precisou de ajuda:</p><p className="text-sm text-foreground">{s.questoesAjuda}</p>{s.questoesAjudaImagem && <img src={s.questoesAjudaImagem} alt="Questão" className="mt-2 max-h-48 rounded-lg border border-border object-contain" />}</div>)}
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Revisão da prova</p>
                        {s.acertosPosRevisao !== undefined ? (
                          <div className="mt-1">
                            <span className="text-sm text-foreground">Resultado bruto: <strong>{total}</strong></span>
                            <span className="text-sm text-foreground ml-3">Pós-revisão: <strong className="text-primary">{s.acertosPosRevisao}</strong></span>
                            <span className={`text-sm ml-3 font-medium ${ganho! >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>Ganho: {ganho! >= 0 ? '+' : ''}{ganho}</span>
                          </div>
                        ) : (<p className="text-xs text-muted-foreground mt-1">Ainda não revisado</p>)}
                      </div>
                      {editingRevisao !== s.id && (<Button size="sm" variant="outline" onClick={() => { setEditingRevisao(s.id); setRevisaoValue(s.acertosPosRevisao ?? total); }}>{s.acertosPosRevisao !== undefined ? 'Editar' : 'Registrar revisão'}</Button>)}
                    </div>
                    {editingRevisao === s.id && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input type="number" min={0} max={180} value={revisaoValue} onChange={e => setRevisaoValue(Number(e.target.value))} className="bg-card border-border w-28" />
                        <span className="text-xs text-muted-foreground">acertos após revisão</span>
                        <Button size="sm" onClick={() => handleSaveRevisao(s.id)}>Salvar</Button>
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
