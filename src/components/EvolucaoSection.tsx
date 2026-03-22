import React, { useState, useEffect, useMemo } from 'react';
import { getSimulados, getProvasEnem, getStudents, updateSimulado, updateProvaEnem, getTABRecords } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { TrendingUp, Target, Rocket, ClipboardList, Award, CheckCircle2, AlertCircle, Filter, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Simulado, ProvaEnem, TABRecord, Student } from '@/types';

interface Props { alunoId: string; }

const areas = [
  { value: 'total', label: 'Desempenho Geral' },
  { value: 'linguagens', label: 'Linguagens' },
  { value: 'humanas', label: 'Humanas' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'matematica', label: 'Matemática' },
];

export default function EvolucaoSection({ alunoId }: Props) {
  const [activeTab, setActiveTab] = useState<'simulados' | 'provas'>('simulados');
  const [selectedArea, setSelectedArea] = useState('total');
  const [loading, setLoading] = useState(true);
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [provas, setProvas] = useState<ProvaEnem[]>([]);
  const [tabRecords, setTabRecords] = useState<TABRecord[]>([]);
  const [student, setStudent] = useState<Student | null>(null);

  const fetchData = async () => {
    try {
      const [s, p, t, allS] = await Promise.all([
        getSimulados(alunoId),
        getProvasEnem(alunoId),
        getTABRecords(alunoId),
        getStudents()
      ]);
      setSimulados(s);
      setProvas(p);
      setTabRecords(t);
      setStudent(allS.find(st => st.id === alunoId) || null);
    } catch (err) {
      console.error('Erro ao buscar dados de evolução:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [alunoId]);

  const chartData = useMemo(() => {
    const source = activeTab === 'simulados' ? simulados : [...provas].sort((a, b) => a.ano - b.ano);
    return source.map((item, i) => {
      let real = 0;
      let avoidable = 0;
      const maxQuestoes = selectedArea === 'total' ? 180 : 45;

      if (selectedArea === 'total') {
        real = item.linguagens + item.humanas + item.natureza + item.matematica;
        avoidable = (item.erroLacunaConteudo || 0) + (item.erroDesatencao || 0) + (item.erroBanal || 0);
      } else {
        real = (item as any)[selectedArea] || 0;
        const totalReal = item.linguagens + item.humanas + item.natureza + item.matematica;
        const globalAvoidable = (item.erroLacunaConteudo || 0) + (item.erroDesatencao || 0) + (item.erroBanal || 0);
        avoidable = totalReal > 0 ? (real / totalReal) * globalAvoidable : 0;
      }

      return {
        name: activeTab === 'simulados' ? `Sim #${(item as any).numero || i + 1}` : `ENEM ${item.ano}`,
        real,
        projetado: Math.min(maxQuestoes, Math.round(real + avoidable)),
        meta: selectedArea === 'total' ? student?.meta || 0 : Math.round((student?.meta || 0) / 4)
      };
    });
  }, [activeTab, selectedArea, simulados, provas, student]);

  const radarData = useMemo(() => {
    const source = activeTab === 'simulados' ? simulados : provas;
    const totals = { lacuna: 0, desatencao: 0, banal: 0, naoEstudado: 0, total: 0 };
    source.forEach(s => {
      totals.lacuna += s.erroLacunaConteudo || 0;
      totals.desatencao += s.erroDesatencao || 0;
      totals.banal += s.erroBanal || 0;
      totals.naoEstudado += s.erroConteudoNaoEstudado || 0;
    });

    if (activeTab === 'provas') {
      tabRecords.forEach(r => {
        r.questoes.forEach(q => {
          if (q.status === 'erro') {
            if (q.tipoErro === 'lacuna') totals.lacuna++;
            else if (q.tipoErro === 'desatencao') totals.desatencao++;
            else if (q.tipoErro === 'desconhecimento') totals.naoEstudado++;
          }
        });
      });
    }

    totals.total = totals.lacuna + totals.desatencao + totals.banal + totals.naoEstudado;
    if (totals.total === 0) return null;
    return [
      { subject: 'Lacuna', A: Math.round((totals.lacuna / totals.total) * 100) },
      { subject: 'Desatenção', A: Math.round((totals.desatencao / totals.total) * 100) },
      { subject: 'Banal', A: Math.round((totals.banal / totals.total) * 100) },
      { subject: 'Não Estudado', A: Math.round((totals.naoEstudado / totals.total) * 100) },
    ];
  }, [activeTab, simulados, provas, tabRecords]);

  const handleToggleCorrection = async (id: string, current: boolean) => {
    if (activeTab === 'simulados') {
      await updateSimulado(id, { correcaoLacunas: !current });
    } else {
      await updateProvaEnem(id, { correcaoLacunas: !current });
    }
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <h2 className="font-display text-2xl text-primary flex items-center gap-2">
          <TrendingUp className="h-6 w-6" /> EVOLUÇÃO ESTRATÉGICA
        </h2>
        
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-[180px] border-none bg-transparent h-8 focus:ring-0">
              <SelectValue placeholder="Selecione a área" />
            </SelectTrigger>
            <SelectContent>
              {areas.map(a => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="simulados" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-card border border-border w-full justify-start p-1 h-12">
          <TabsTrigger value="simulados" className="flex-1 lg:flex-none flex items-center gap-2 data-[state=active]:bg-primary h-full">
            <ClipboardList className="h-4 w-4" /> Simulados
          </TabsTrigger>
          <TabsTrigger value="provas" className="flex-1 lg:flex-none flex items-center gap-2 data-[state=active]:bg-primary h-full">
            <Award className="h-4 w-4" /> Provas do ENEM
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2 pt-5 bg-muted/20">
              <CardTitle className="font-display text-sm text-primary uppercase tracking-tight flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2 px-1">
                  <TrendingUp className="h-4 w-4" /> PERFORMANCE GLOBAL: REAL VS PROJETADO
                </span>
                <div className="flex items-center gap-4 text-[11px] normal-case font-sans tracking-normal bg-background/50 px-3 py-1 rounded-full border border-border/50">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Real</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Projetado</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" /> Meta</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {chartData.length > 0 ? (
                <div className="h-[260px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 20%, 16%)" />
                      <XAxis dataKey="name" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 12 }} />
                      <YAxis domain={[0, selectedArea === 'total' ? 180 : 45]} tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ background: 'hsl(155, 30%, 7%)', border: '1px solid hsl(155, 20%, 16%)', borderRadius: 8, fontSize: '12px' }}
                        labelStyle={{ color: 'white', marginBottom: '4px', fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                      <Line name="Pontuação Real" type="monotone" dataKey="real" stroke="hsl(43, 76%, 52%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line name="Com Correção de Lacunas" type="monotone" dataKey="projetado" stroke="hsl(150, 100%, 50%)" strokeWidth={2} strokeDasharray="5 5" />
                      <Line name="Meta de Acertos" type="monotone" dataKey="meta" stroke="hsl(0, 100%, 50%)" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm italic">
                  Ainda não há dados suficientes para esta categoria.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-0 pt-4 bg-muted/10">
                <CardTitle className="font-display text-[11px] text-muted-foreground uppercase text-center tracking-widest">DNA dos Erros (%)</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {radarData ? (
                  <div className="h-[210px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(155, 20%, 16%)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 9 }} />
                        <Radar dataKey="A" stroke="hsl(43, 76%, 52%)" fill="hsl(43, 76%, 52%)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-[10px] italic">
                    Sem dados de análise de erros.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="py-2.5 bg-muted/40">
                <CardTitle className="font-display text-[11px] text-primary uppercase flex items-center gap-2 tracking-wide">
                  <CheckCircle2 className="h-3 w-3" /> TRACKING DE CORREÇÕES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[140px] overflow-y-auto space-y-px custom-scrollbar">
                  {(activeTab === 'simulados' ? simulados : provas).slice(-8).reverse().map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 text-[10px]">
                      <div className="flex flex-col min-w-0">
                        <span className="text-foreground font-medium truncate">
                          {activeTab === 'simulados' ? `Simulado #${item.numero}` : `ENEM ${item.ano}`}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.linguagens + item.humanas + item.natureza + item.matematica} acertos
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[8px] font-bold ${item.correcaoLacunas ? "text-emerald-400" : "text-yellow-500"}`}>
                          {item.correcaoLacunas ? "OK" : "V"}
                        </span>
                        <Checkbox 
                          checked={item.correcaoLacunas} 
                          onCheckedChange={() => handleToggleCorrection(item.id, item.correcaoLacunas)}
                          className="h-3 w-3"
                        />
                      </div>
                    </div>
                  ))}
                  {((activeTab === 'simulados' ? simulados : provas).length === 0) && (
                    <p className="text-[10px] text-muted-foreground italic text-center py-4">Nenhum registro encontrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm text-foreground">Potencial de Ganho Bruto</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Eliminando as falhas de conteúdo e atenção, seu aproveitamento médio subiria em 
                      <strong className="text-primary ml-1">
                        +{Math.round((chartData.reduce((acc, curr) => acc + (curr.projetado - curr.real), 0) / (chartData.length || 1)))}
                      </strong> acertos na área selecionada.
                    </p>
                  </div>
                </div>
              </CardContent>
           </Card>
           
           <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm text-foreground">Status do Acerto Inicial</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu ponto de partida foi <strong>{student?.acertosIniciais || 0}</strong> acertos. 
                      Hoje, sua média real está em <strong>{Math.round(chartData.reduce((acc, curr) => acc + curr.real, 0) / (chartData.length || 1))}</strong>. 
                      Uma evolução de <strong className="text-emerald-400">+{Math.max(0, Math.round(chartData.reduce((acc, curr) => acc + curr.real, 0) / (chartData.length || 1)) - (student?.acertosIniciais || 0))}</strong> acertos!
                    </p>
                  </div>
                </div>
              </CardContent>
           </Card>
        </div>
      </Tabs>
    </div>
  );
}
