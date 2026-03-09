import React, { useEffect, useState } from 'react';
import { getSimulados, getProvasEnem } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props { alunoId: string; }

const areaOptions = [
  { key: 'total', label: 'Total de Acertos', color: 'hsl(43, 76%, 52%)' },
  { key: 'linguagens', label: 'Linguagens', color: '#3B82F6' },
  { key: 'humanas', label: 'Humanas', color: '#F59E0B' },
  { key: 'natureza', label: 'Natureza', color: '#10B981' },
  { key: 'matematica', label: 'Matemática', color: '#A855F7' },
];

export default function EvolucaoSection({ alunoId }: Props) {
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [selected, setSelected] = useState('total');

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
