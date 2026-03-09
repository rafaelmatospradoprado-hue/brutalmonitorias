import React, { useEffect, useState } from 'react';
import { getSimulados, getProvasEnem } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props { alunoId: string; }

export default function EvolucaoSection({ alunoId }: Props) {
  const [data, setData] = useState<{ nome: string; total: number; linguagens: number; humanas: number; natureza: number; matematica: number }[]>([]);

  useEffect(() => {
    const simulados = getSimulados(alunoId).map((s, i) => ({
      nome: `Sim ${i + 1}`,
      total: s.linguagens + s.humanas + s.natureza + s.matematica,
      linguagens: s.linguagens,
      humanas: s.humanas,
      natureza: s.natureza,
      matematica: s.matematica,
    }));
    const provas = getProvasEnem(alunoId).sort((a, b) => a.ano - b.ano).map(p => ({
      nome: `ENEM ${p.ano}`,
      total: p.linguagens + p.humanas + p.natureza + p.matematica,
      linguagens: p.linguagens,
      humanas: p.humanas,
      natureza: p.natureza,
      matematica: p.matematica,
    }));
    setData([...provas, ...simulados]);
  }, [alunoId]);

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl text-primary mb-6">EVOLUÇÃO</h2>

      {data.length === 0 ? (
        <p className="text-muted-foreground text-sm">Registre simulados ou provas ENEM para visualizar a evolução.</p>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-display text-sm text-muted-foreground mb-4">Total de Acertos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 20%, 16%)" />
                <XAxis dataKey="nome" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(155, 30%, 7%)', border: '1px solid hsl(155, 20%, 16%)', borderRadius: 8, color: 'hsl(43, 60%, 85%)' }} />
                <Line type="monotone" dataKey="total" stroke="hsl(43, 76%, 52%)" strokeWidth={2} dot={{ fill: 'hsl(43, 76%, 52%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-display text-sm text-muted-foreground mb-4">Por Área</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(155, 20%, 16%)" />
                <XAxis dataKey="nome" tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(43, 20%, 55%)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(155, 30%, 7%)', border: '1px solid hsl(155, 20%, 16%)', borderRadius: 8, color: 'hsl(43, 60%, 85%)' }} />
                <Legend wrapperStyle={{ color: 'hsl(43, 60%, 85%)' }} />
                <Line type="monotone" dataKey="linguagens" stroke="#3B82F6" strokeWidth={1.5} name="Linguagens" />
                <Line type="monotone" dataKey="humanas" stroke="#F59E0B" strokeWidth={1.5} name="Humanas" />
                <Line type="monotone" dataKey="natureza" stroke="#10B981" strokeWidth={1.5} name="Natureza" />
                <Line type="monotone" dataKey="matematica" stroke="#A855F7" strokeWidth={1.5} name="Matemática" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
