import React, { useMemo } from 'react';
import { useSimulados, useProvasEnem } from '@/hooks/useSupabaseData';
import { Student } from '@/types';
import { ShieldCheck, ShieldAlert, ShieldX, Target } from 'lucide-react';

interface Props { student: Student; }

type Zone = 'segura' | 'atencao' | 'risco';

export default function StudentStatusIndicator({ student }: Props) {
  const { simulados } = useSimulados(student.id);
  const { provas } = useProvasEnem(student.id);

  const { mediaAtual, distancia, zona } = useMemo(() => {
    const recents = [...simulados].slice(-5);
    const lastProvas = [...provas].slice(-2);
    const allEntries = [...recents, ...lastProvas];

    if (allEntries.length === 0) return { mediaAtual: null, distancia: null, zona: null };

    const totals = allEntries.map(e => e.linguagens + e.humanas + e.natureza + e.matematica);
    const media = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const dist = student.meta - media;

    let zona: Zone;
    if (dist < 10) zona = 'segura';
    else if (dist <= 25) zona = 'atencao';
    else zona = 'risco';

    return { mediaAtual: media, distancia: dist, zona };
  }, [simulados, provas, student.meta]);

  if (zona === null) return null;

  const config: Record<Zone, {
    label: string; desc: string;
    icon: React.ElementType;
    card: string; badge: string;
  }> = {
    segura: {
      label: 'Zona Segura',
      desc: 'Desempenho dentro da meta',
      icon: ShieldCheck,
      card: 'border-emerald-500/40 bg-emerald-500/5',
      badge: 'text-emerald-400',
    },
    atencao: {
      label: 'Zona de Atenção',
      desc: 'Evolução necessária para atingir a meta',
      icon: ShieldAlert,
      card: 'border-yellow-500/40 bg-yellow-500/5',
      badge: 'text-yellow-400',
    },
    risco: {
      label: 'Zona de Risco',
      desc: 'Desempenho significativamente abaixo da meta',
      icon: ShieldX,
      card: 'border-destructive/40 bg-destructive/5',
      badge: 'text-destructive',
    },
  };

  const cfg = config[zona];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-lg border px-4 py-3 flex items-center justify-between flex-wrap gap-3 mb-6 ${cfg.card}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${cfg.badge}`} />
        <div>
          <p className={`font-display text-sm ${cfg.badge}`}>{cfg.label}</p>
          <p className="text-xs text-muted-foreground">{cfg.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span>Meta: <strong className="text-foreground">{student.meta}</strong></span>
        </div>
        <div>
          Média atual: <strong className={cfg.badge}>{mediaAtual}</strong>
        </div>
        <div>
          Distância: <strong className={distancia! <= 0 ? 'text-emerald-400' : cfg.badge}>
            {distancia! > 0 ? `-${distancia}` : `+${Math.abs(distancia!)}`}
          </strong>
        </div>
      </div>
    </div>
  );
}
