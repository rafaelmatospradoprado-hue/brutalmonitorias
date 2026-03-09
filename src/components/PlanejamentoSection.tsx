import React, { useState, useEffect, useMemo } from 'react';
import { PlanejamentoSemanal } from '@/types';
import { getPlanejamentos, savePlanejamento } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';

interface Props { alunoId: string; }

function getENEMDate(): Date {
  // First Sunday of November of the current or next applicable year
  const now = new Date();
  let year = now.getFullYear();
  const getFirstSunday = (y: number) => {
    const nov1 = new Date(y, 10, 1); // November 1
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

function getDaysUntilENEM(): number {
  const now = new Date();
  return Math.max(0, Math.ceil((getENEMDate().getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

function getWeeksUntilENEM(): number {
  return Math.max(1, Math.ceil(getDaysUntilENEM() / 7));
}

export default function PlanejamentoSection({ alunoId }: Props) {
  const totalWeeks = useMemo(() => Math.min(getWeeksUntilENEM(), 52), []);
  const daysLeft = useMemo(() => getDaysUntilENEM(), []);
  const weeksLeft = useMemo(() => getWeeksUntilENEM(), []);
  const [planejamentos, setPlanejamentos] = useState<PlanejamentoSemanal[]>([]);
  const [openWeek, setOpenWeek] = useState<number | null>(1);

  useEffect(() => { setPlanejamentos(getPlanejamentos(alunoId)); }, [alunoId]);

  const getOrCreate = (semana: number): PlanejamentoSemanal => {
    const existing = planejamentos.find(p => p.semana === semana);
    if (existing) return existing;
    return { id: crypto.randomUUID(), alunoId, semana, conteudos: '', listas: '', simulados: '', observacoes: '' };
  };

  const handleSave = (p: PlanejamentoSemanal) => {
    savePlanejamento(p);
    setPlanejamentos(getPlanejamentos(alunoId));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="font-display text-2xl text-primary">PLANEJAMENTO SEMANAL</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-display text-primary">{daysLeft}</span> dias
          </div>
          <div>
            <span className="font-display text-primary">{weeksLeft}</span> semanas
          </div>
          <span className="text-xs">até o ENEM</span>
        </div>
      </div>

      <div className="space-y-1">
        {Array.from({ length: Math.min(totalWeeks, 30) }, (_, i) => i + 1).map(semana => {
          const p = getOrCreate(semana);
          const isOpen = openWeek === semana;
          return (
            <div key={semana} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenWeek(isOpen ? null : semana)}
                className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
              >
                <span className="font-display text-sm text-foreground">Semana {semana}</span>
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
              {isOpen && (
                <div className="p-4 space-y-3 bg-card/50">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Conteúdos estudados</label>
                    <Textarea value={p.conteudos} onChange={e => handleSave({ ...p, conteudos: e.target.value })} className="bg-background border-border text-sm min-h-[60px]" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Listas de exercícios</label>
                    <Textarea value={p.listas} onChange={e => handleSave({ ...p, listas: e.target.value })} className="bg-background border-border text-sm min-h-[60px]" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Simulados realizados</label>
                    <Textarea value={p.simulados} onChange={e => handleSave({ ...p, simulados: e.target.value })} className="bg-background border-border text-sm min-h-[60px]" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Observações</label>
                    <Textarea value={p.observacoes} onChange={e => handleSave({ ...p, observacoes: e.target.value })} className="bg-background border-border text-sm min-h-[60px]" />
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
