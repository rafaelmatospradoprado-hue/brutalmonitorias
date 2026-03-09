import React, { useEffect, useState, useMemo } from 'react';
import { getSimulados, getProvasEnem, getStudents } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, CalendarDays, Rocket } from 'lucide-react';

interface Props { alunoId: string; }

const areaOptions = [
  { key: 'total', label: 'Total de Acertos', color: 'hsl(43, 76%, 52%)' },
  { key: 'linguagens', label: 'Linguagens', color: '#3B82F6' },
  { key: 'humanas', label: 'Humanas', color: '#F59E0B' },
  { key: 'natureza', label: 'Natureza', color: '#10B981' },
  { key: 'matematica', label: 'Matemática', color: '#A855F7' },
];

function getENEMDate(): Date {
  const now = new Date();
  let year = now.getFullYear();
  const getFirstSunday = (y: number) => {
    const nov1 = new Date(y, 10, 1);
    const dayOfWeek = nov1.getDay();
    const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    return new Date(y, 10, firstSunday);
  };
  let enemDate = getFirstSunday(year);
  if (enemDate.getTime() < now.getTime()) {
    enemDate = getFirstSunday(year + 1);
  }
  return enemDate;
}

function getMonthsUntilENEM(): number {
  const now = new Date();
  const enem = getENEMDate();
  return Math.max(1, Math.ceil((enem.getTime() - now.getTime()) / (30 * 24 * 60 * 60 * 1000)));
}

export default function EvolucaoSection({ alunoId }: Props) {
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [selected, setSelected] = useState('total');
  const student = useMemo(() => getStudents().find(s => s.id === alunoId), [alunoId]);

  useEffect(() => {
    const simulados = getSimulados(alunoId).map((s, i) => ({
      nome: `Sim #${s.numero ?? i + 1}`,
      total: s.linguagens + s.humanas + s.natureza + s.matematica,
      linguagens: s.linguagens, humanas: s.humanas, natureza: s.natureza, matematica: s.matematica,
    }));
    const provas = getProvasEnem(alunoId).sort((a, b) => a.ano - b.ano).map(p => ({
      nome: `ENEM ${p.ano}`,
      total: p.linguagens + p.humanas + p.natureza + p.matematica,
      linguagens: p.linguagens, humanas: p.humanas, natureza: p.natureza, matematica: p.matematica,
    }));
    setData([...provas, ...simulados]);
  }, [alunoId]);

  const opt = areaOptions.find(a => a.key === selected)!;

  // Calculate projection
  const projection = useMemo(() => {
    const simulados = getSimulados(alunoId);
    if (simulados.length < 2) return null;

    const recent = simulados.slice(-5);
    const totals = recent.map(s => s.linguagens + s.humanas + s.natureza + s.matematica);
    
    // Calculate average growth per simulado
    const growthRates: number[] = [];
    for (let i = 1; i < totals.length; i++) {
      growthRates.push(totals[i] - totals[i - 1]);
    }
    const avgGrowth = growthRates.length > 0 ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length : 0;
    
    const currentAvg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const monthsLeft = getMonthsUntilENEM();
    
    // Project: ~1 simulado/month growth
    const projectedTotal = Math.round(currentAvg + (avgGrowth * monthsLeft));
    
    return {
      currentAvg,
      projectedTotal,
      growthPerMonth: Math.round(avgGrowth),
      meta: student?.meta ?? 150,
      diff: projectedTotal - (student?.meta ?? 150),
    };
  }, [alunoId, student?.meta]);

  const enemYear = getENEMDate().getFullYear();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="font-display text-2xl text-primary">EVOLUÇÃO</h2>
        <div className="flex gap-1 flex-wrap">
          {areaOptions.map(a => (
            <button
              key={a.key}
              onClick={() => setSelected(a.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selected === a.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* PROJEÇÃO DE ACERTOS */}
      {projection && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider">Projeção para ENEM {enemYear}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Acertos Projetados</span>
              </div>
              <p className={`font-display text-2xl ${projection.diff >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                {projection.projectedTotal}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Target className="h-3.5 w-3.5" />
                <span>Meta do Aluno</span>
              </div>
              <p className="font-display text-2xl text-foreground">{projection.meta}</p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Diferença</span>
              </div>
              <p className={`font-display text-2xl ${projection.diff >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                {projection.diff >= 0 ? `+${projection.diff}` : projection.diff}
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Crescimento/mês</div>
              <p className={`font-display text-2xl ${projection.growthPerMonth >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                {projection.growthPerMonth >= 0 ? `+${projection.growthPerMonth}` : projection.growthPerMonth}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Se continuar evoluindo nesse ritmo: <strong className={projection.diff >= 0 ? 'text-emerald-400' : 'text-destructive'}>
              {projection.diff >= 0 ? 'Projeção acima da meta ✓' : 'Precisa acelerar para atingir a meta'}
            </strong>
          </p>
        </div>
      )}

      {data.length === 0 ? (
        <p className="text-muted-foreground text-sm">Registre simulados ou provas ENEM para visualizar a evolução.</p>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm text-muted-foreground mb-4">{opt.label}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 20%, 16%)" />
              <XAxis dataKey="nome" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(155, 30%, 7%)', border: '1px solid hsl(155, 20%, 16%)', borderRadius: 8, color: 'hsl(43, 60%, 85%)' }} />
              <Line type="monotone" dataKey={selected} stroke={opt.color} strokeWidth={2} dot={{ fill: opt.color, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
