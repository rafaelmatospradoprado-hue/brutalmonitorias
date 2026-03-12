import React, { useMemo } from 'react';
import { useSimulados, useProvasEnem, useContents, useStudents } from '@/hooks/useSupabaseData';
import { AlertTriangle, CheckCircle2, AlertCircle, Target, TrendingDown, Zap } from 'lucide-react';

interface Props { alunoId: string; }

const AREAS = [
  { key: 'linguagens', label: 'Linguagens', max: 45 },
  { key: 'humanas',    label: 'Humanas',    max: 45 },
  { key: 'natureza',   label: 'Natureza',   max: 45 },
  { key: 'matematica', label: 'Matemática', max: 45 },
] as const;

type AreaKey = typeof AREAS[number]['key'];

function classifyPct(pct: number): 'critico' | 'moderado' | 'dominado' {
  if (pct < 40) return 'critico';
  if (pct < 70) return 'moderado';
  return 'dominado';
}

export default function MapaLacunasSection({ alunoId }: Props) {
  const { students } = useStudents();
  const { simulados } = useSimulados(alunoId);
  const { provas } = useProvasEnem(alunoId);
  const { contents } = useContents(alunoId);

  const student = useMemo(() => students.find(s => s.id === alunoId), [students, alunoId]);

  const areaStats = useMemo(() => {
    const recent = [...simulados].slice(-5);
    const recentProvas = [...provas].slice(-3);
    const allEntries = [...recent, ...recentProvas];
    return AREAS.map(area => {
      const avg = allEntries.length > 0
        ? allEntries.reduce((sum, e) => sum + (e[area.key as AreaKey] ?? 0), 0) / allEntries.length
        : null;
      const pct = avg !== null ? (avg / area.max) * 100 : null;
      return { ...area, avg, pct };
    });
  }, [simulados, provas]);

  const gapContents = useMemo(() => {
    const lacunas: { nome: string; area: string; status: 'critico' | 'moderado' | 'dominado' }[] = [];
    contents.filter(c => !c.dominio).forEach(c => {
      const areaMap: Record<string, AreaKey> = { Linguagens: 'linguagens', Humanas: 'humanas', Natureza: 'natureza', Matemática: 'matematica' };
      const statArea = areaStats.find(a => a.key === areaMap[c.area]);
      const areaPct = statArea?.pct ?? null;
      let status: 'critico' | 'moderado' | 'dominado';
      if (!c.teoria && !c.pratica) status = 'critico';
      else if (!c.pratica || (areaPct !== null && areaPct < 50)) status = 'moderado';
      else status = 'moderado';
      lacunas.push({ nome: c.nome, area: c.area, status });
    });
    lacunas.sort((a, b) => {
      const order = { critico: 0, moderado: 1, dominado: 2 };
      return order[a.status] - order[b.status];
    });
    return lacunas;
  }, [contents, areaStats]);

  const topPrioridades = useMemo(() => gapContents.filter(g => g.status === 'critico').slice(0, 5), [gapContents]);
  const dominated = useMemo(() => contents.filter(c => c.dominio).length, [contents]);

  const statusConfig = {
    critico: { label: 'Lacuna Crítica', icon: AlertTriangle, bar: 'bg-destructive', badge: 'bg-destructive/20 text-destructive border-destructive/30', dot: '🔴' },
    moderado: { label: 'Lacuna Moderada', icon: AlertCircle, bar: 'bg-yellow-500', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: '🟡' },
    dominado: { label: 'Dominado', icon: CheckCircle2, bar: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: '🟢' },
  };

  const hasData = simulados.length > 0 || provas.length > 0;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-2xl text-primary">MAPA DE LACUNAS</h2>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider">Termômetro de Desempenho por Área</h3>
        </div>
        {!hasData ? (
          <p className="text-muted-foreground text-sm">Registre simulados ou provas ENEM para visualizar o termômetro.</p>
        ) : (
          <div className="space-y-4">
            {areaStats.map(area => {
              const pct = area.pct ?? 0;
              const status = area.pct !== null ? classifyPct(pct) : null;
              const avg = area.avg !== null ? Math.round(area.avg) : '—';
              return (
                <div key={area.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-foreground">{area.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">~{avg}/{area.max}</span>
                      {status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[status].badge}`}>
                          {statusConfig[status].dot} {statusConfig[status].label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${!status ? 'bg-muted-foreground' : status === 'critico' ? 'bg-destructive' : status === 'moderado' ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider">Lista de Lacunas Prioritárias</h3>
          <span className="ml-auto text-xs text-muted-foreground">{dominated}/{contents.length} dominados</span>
        </div>
        {contents.length === 0 ? (
          <p className="text-muted-foreground text-sm">Marque conteúdos na seção Conteúdos para ver as lacunas.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {gapContents.slice(0, 20).map((g, i) => {
              const cfg = statusConfig[g.status];
              const Icon = cfg.icon;
              return (
                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cfg.badge}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="text-xs font-medium">{g.nome}</span>
                    <span className="text-xs opacity-60">· {g.area}</span>
                  </div>
                  <span className="text-xs opacity-80">{cfg.label}</span>
                </div>
              );
            })}
            {gapContents.length === 0 && (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Nenhuma lacuna identificada! Continue assim.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {topPrioridades.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider">Prioridade de Ataque</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Conteúdos críticos que precisam de atenção imediata:</p>
          <div className="space-y-2">
            {topPrioridades.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <span className="font-display text-primary text-sm w-5">{i + 1}</span>
                <div>
                  <span className="text-sm text-foreground font-medium">{p.nome}</span>
                  <span className="text-xs text-muted-foreground ml-2">· {p.area}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
