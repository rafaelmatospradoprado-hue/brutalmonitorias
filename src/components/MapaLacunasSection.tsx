import React, { useState, useEffect, useMemo } from 'react';
import { getTABRecords, addTABRecord, updateTABRecord, deleteTABRecord, getStudents, getSimulados, getProvasEnem, getContents } from '@/lib/store';
import { TABQuestion, TABRecord, Simulado, ProvaEnem, ContentItem, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Target, 
  CheckCircle2, 
  PlayCircle, 
  ExternalLink, 
  PenLine, 
  X, 
  AlertCircle,
  TrendingDown,
  Zap,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props { alunoId: string; }

export default function MapaLacunasSection({ alunoId }: Props) {
  const [loading, setLoading] = useState(true);
  const [tabRecords, setTabRecords] = useState<TABRecord[]>([]);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [provas, setProvas] = useState<ProvaEnem[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  const fetchData = async () => {
    try {
      const [t, s, p, c, allS] = await Promise.all([
        getTABRecords(alunoId),
        getSimulados(alunoId),
        getProvasEnem(alunoId),
        getContents(alunoId),
        getStudents()
      ]);
      setTabRecords(t);
      setSimulados(s);
      setProvas(p);
      setContents(c);
      setStudent(allS.find(st => st.id === alunoId) || null);
    } catch (err) {
      console.error('Erro ao buscar dados do Mapa de Lacunas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [alunoId]);
  
  const handleAddBlock = async () => {
    const lastRecord = tabRecords[tabRecords.length - 1];
    const nextBloco = lastRecord ? (lastRecord.bloco % 12) + 1 : 1;
    const nextAno = lastRecord ? lastRecord.provaAno : 2024;
    
    const startNum = ((nextBloco - 1) * 15) + 1;
    const questoes: TABQuestion[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      numeroOriginal: startNum + i,
      status: 'pendente'
    }));

    await addTABRecord({ alunoId, provaAno: nextAno, bloco: nextBloco, questoes });
    await fetchData();
  };

  const handleUpdateQuestion = async (recordId: string, qId: number, updates: Partial<TABQuestion>) => {
    const record = tabRecords.find(r => r.id === recordId);
    if (!record) return;
    const newQuestoes = record.questoes.map(q => q.id === qId ? { ...q, ...updates } : q);
    await updateTABRecord(recordId, { questoes: newQuestoes });
    await fetchData();
  };

  const handleDeleteSubrecord = async (recordId: string) => {
    if (confirm('Deseja excluir este bloco de questões?')) {
      await deleteTABRecord(recordId);
      await fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-primary flex items-center gap-3">
            <Target className="h-8 w-8 text-primary shadow-sm" /> 
            MAPA DE LACUNAS
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Modelo TAB: Gestão de lacunas em blocos de 15 questões.</p>
        </div>
        <Button onClick={handleAddBlock} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Novo Bloco TAB
        </Button>
      </div>

      <Tabs defaultValue="gestao" className="w-full">
        <TabsList className="bg-card/50 border border-border p-1 h-11 w-fit mb-6">
          <TabsTrigger value="gestao" className="flex items-center gap-2 px-6 data-[state=active]:bg-primary h-full">
            <LayoutDashboard className="h-4 w-4" /> Gestão de Blocos
          </TabsTrigger>
          <TabsTrigger value="panorama" className="flex items-center gap-2 px-6 data-[state=active]:bg-primary h-full">
            <TrendingDown className="h-4 w-4" /> Panorama Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gestao" className="space-y-6">
          {tabRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl bg-card/20 group hover:border-primary/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-primary/40" />
              </div>
              <p className="text-muted-foreground text-center max-w-xs">
                Inicie seu primeiro bloco TAB para começar a mapear suas lacunas de forma inteligente.
              </p>
              <Button onClick={handleAddBlock} variant="outline" className="mt-6 border-primary/20 hover:bg-primary/5">
                Começar Agora
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {[...tabRecords].reverse().map(record => (
                <Card key={record.id} className="bg-card/40 backdrop-blur-sm border-border hover:border-primary/20 transition-all overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between py-4 bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-display uppercase tracking-widest">
                        Bloco {record.bloco}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span className="font-display text-foreground">ENEM {record.provaAno}</span>
                        <span className="opacity-40">|</span>
                        <span>Q{record.questoes[0].numeroOriginal} - Q{record.questoes[14].numeroOriginal}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSubrecord(record.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-3 mb-8">
                      {record.questoes.map(q => {
                        const isCorrected = q.status === 'erro' && (
                          (q.tipoErro === 'lacuna' && q.gabaritoOk && q.escritaOk && q.videoOk) ||
                          (q.tipoErro === 'desconhecimento' && q.estudoOk) ||
                          (q.tipoErro === 'desatencao' && q.status === 'erro')
                        );
                        
                        return (
                          <div key={q.id} className="flex flex-col items-center gap-1.5 relative">
                            <button 
                              onClick={() => {
                                const nextStatus = q.status === 'pendente' ? 'acerto' : q.status === 'acerto' ? 'erro' : 'pendente';
                                handleUpdateQuestion(record.id, q.id, { 
                                  status: nextStatus as any, 
                                  tipoErro: nextStatus === 'erro' ? (q.tipoErro || 'lacuna') : undefined 
                                });
                              }}
                              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all transform hover:scale-105 active:scale-95 ${
                                q.status === 'acerto' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                                q.status === 'erro' ? (isCorrected ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-destructive/10 border-destructive/40 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.1)]') :
                                'bg-muted/50 border-border/50 text-muted-foreground hover:border-primary/40'
                              }`}
                            >
                              {q.numeroOriginal}
                              {isCorrected && (
                                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-0.5 shadow-md border border-background">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </button>
                            {q.status === 'erro' && (
                              <Select 
                                value={q.tipoErro} 
                                onValueChange={v => handleUpdateQuestion(record.id, q.id, { tipoErro: v as any })}
                              >
                                <SelectTrigger className="h-5 w-10 p-0 border-none bg-transparent focus:ring-0">
                                  <div className={`text-[9px] uppercase font-black text-center w-full tracking-tighter ${
                                    q.tipoErro === 'lacuna' ? 'text-yellow-500' :
                                    q.tipoErro === 'desconhecimento' ? 'text-blue-400' : 'text-foreground/40'
                                  }`}>
                                    {q.tipoErro === 'lacuna' ? 'LAC' : q.tipoErro === 'desconhecimento' ? 'DESC' : 'ATEN'}
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
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

                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <h4 className="text-xs font-display text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-primary" /> Diagnóstico de Erros do Bloco
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {record.questoes.filter(q => q.status === 'erro').map(q => (
                          <div key={q.id} className="p-4 rounded-2xl bg-muted/30 border border-border flex flex-col md:flex-row gap-4 items-start md:items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-black text-destructive mb-1">QUESTÃO</span>
                              <div className="w-12 h-12 rounded-xl bg-destructive/10 border-2 border-destructive/40 flex items-center justify-center text-lg font-bold text-destructive">
                                {q.numeroOriginal}
                              </div>
                            </div>
                            
                            {q.tipoErro === 'lacuna' ? (
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-yellow-500 text-yellow-950 hover:bg-yellow-400 flex items-center gap-1 text-[10px] font-bold">
                                    <AlertCircle className="h-3 w-3" /> FILTRO A: LACUNA
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <div className="flex items-center gap-2 bg-background/40 p-2.5 rounded-xl border border-border group hover:border-primary/30 transition-colors">
                                    <Checkbox checked={q.gabaritoOk} onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { gabaritoOk: !!v })} />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-primary">1. REFAZER</span>
                                      <span className="text-[8px] text-muted-foreground">Pelo gabarito</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 bg-background/40 p-2.5 rounded-xl border border-border group hover:border-emerald-500/30 transition-colors">
                                    <Checkbox checked={q.escritaOk} onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { escritaOk: !!v })} />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-emerald-400">2. ESCRITA</span>
                                      <a href="https://plataformaassaad.com.br/blog/enem-2025/" target="_blank" className="text-[8px] text-muted-foreground hover:text-emerald-400 flex items-center gap-1 underline decoration-dotted">
                                        Assaad Blog <ExternalLink className="h-2 w-2" />
                                      </a>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 bg-background/40 p-2.5 rounded-xl border border-border group hover:border-blue-500/30 transition-colors">
                                    <Checkbox checked={q.videoOk} onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { videoOk: !!v })} />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-blue-400">3. VÍDEO</span>
                                      <span className="text-[8px] text-muted-foreground">Ver resolução</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : q.tipoErro === 'desconhecimento' ? (
                              <div className="flex-1">
                                <div className="flex flex-col gap-3 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 group hover:bg-blue-500/10 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Checkbox 
                                      className="h-5 w-5 border-blue-500/50 data-[state=checked]:bg-blue-500 rounded-md" 
                                      checked={q.estudoOk} 
                                      onCheckedChange={v => handleUpdateQuestion(record.id, q.id, { estudoOk: !!v })} 
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-blue-300 tracking-wider">FILTRO B: DESCONHECIMENTO</span>
                                      <span className="text-[11px] text-muted-foreground leading-tight">Matéria não vista ou esquecida. Re-estudo obrigatório.</span>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline" className="text-[10px] h-8 w-fit border-blue-500/30 hover:bg-blue-500/20 text-blue-300 flex items-center gap-2 uppercase font-black tracking-widest pl-3 pr-4 self-end md:self-start">
                                    <PlayCircle className="h-4 w-4" /> Assistir Aula
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 flex items-center justify-between bg-muted/40 p-4 rounded-2xl border border-border">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-muted-foreground tracking-widest">ERRO: DESATENÇÃO</span>
                                  <span className="text-[11px] text-muted-foreground">Consertado apenas com foco. Não requer nova teoria.</span>
                                </div>
                                <div className="text-emerald-500">
                                  <CheckCircle2 className="h-6 w-6 opacity-40" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {record.questoes.filter(q => q.status === 'erro').length === 0 && (
                          <div className="col-span-1 md:col-span-2 py-8 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Nenhum erro registrado neste bloco. Excelente!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="panorama" className="space-y-6">
          <PanoramaContent alunoId={alunoId} simulados={simulados} provas={provas} contents={contents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PanoramaContent({ alunoId, simulados, provas, contents }: { alunoId: string, simulados: Simulado[], provas: ProvaEnem[], contents: ContentItem[] }) {
  const AREAS = [
    { key: 'linguagens', label: 'Linguagens', max: 45 },
    { key: 'humanas',    label: 'Humanas',    max: 45 },
    { key: 'natureza',   label: 'Natureza',   max: 45 },
    { key: 'matematica', label: 'Matemática', max: 45 },
  ] as const;

  const areaStats = useMemo(() => {
    const recent = [...simulados].slice(-5);
    const recentProvas = [...provas].slice(-3);
    const allEntries = [...recent, ...recentProvas];

    return AREAS.map(area => {
      const avg = allEntries.length > 0
        ? allEntries.reduce((sum: number, e: any) => sum + (e[area.key] ?? 0), 0) / allEntries.length
        : null;
      const pct = avg !== null ? (avg / area.max) * 100 : null;
      return { ...area, avg, pct };
    });
  }, [simulados, provas]);

  const gapContents = useMemo(() => {
    return contents
      .filter(c => !c.dominio)
      .map(c => ({
        nome: c.nome,
        area: c.area,
        status: !c.teoria && !c.pratica ? 'critico' : 'moderado'
      } as const));
  }, [contents]);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display text-sm text-primary uppercase tracking-widest mb-6">Termômetro de Desempenho</h3>
        <div className="space-y-5">
          {areaStats.map(area => (
            <div key={area.key}>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-foreground">{area.label}</span>
                <span className="text-muted-foreground">{area.avg !== null ? Math.round(area.avg) : '--'}/{area.max}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-700" 
                  style={{ width: `${area.pct || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display text-sm text-primary uppercase tracking-widest mb-4">Lacunas Identificadas ({gapContents.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {gapContents.map((g, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 text-xs">
              <span className="text-foreground font-medium">{g.nome}</span>
              <Badge variant="outline" className={g.status === 'critico' ? 'text-destructive border-destructive/20' : 'text-yellow-500 border-yellow-500/20'}>
                {g.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
