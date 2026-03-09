import React from 'react';
import { getStudents, getSimulados, getProvasEnem } from '@/lib/store';
import { Users, ClipboardList, Award, TrendingUp } from 'lucide-react';
import { contentTemplate } from '@/data/contentTemplate';

export default function DashboardOverview() {
  const students = getStudents();
  const totalSimulados = students.reduce((acc, s) => acc + getSimulados(s.id).length, 0);
  const totalProvas = students.reduce((acc, s) => acc + getProvasEnem(s.id).length, 0);

  const stats = [
    { label: 'Alunos', value: students.length, icon: Users },
    { label: 'Conteúdos', value: contentTemplate.length, icon: TrendingUp },
    { label: 'Simulados', value: totalSimulados, icon: ClipboardList },
    { label: 'Provas ENEM', value: totalProvas, icon: Award },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-primary tracking-wider">PERFORMANCE BRUTAL</h1>
        <p className="text-muted-foreground text-sm mt-1">Painel Estratégico de Evolução ENEM</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="font-display text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {students.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-foreground mb-3">Alunos Recentes</h3>
          <div className="space-y-2">
            {students.slice(0, 5).map(s => {
              const pct = s.meta > s.acertosIniciais ? Math.round(((s.acertosAtuais - s.acertosIniciais) / (s.meta - s.acertosIniciais)) * 100) : 0;
              return (
                <div key={s.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-foreground">{s.nome}</span>
                    <span className="text-xs text-muted-foreground ml-2">({s.objetivo})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{s.acertosAtuais}/{s.meta}</span>
                    <div className="w-20 bg-muted rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
