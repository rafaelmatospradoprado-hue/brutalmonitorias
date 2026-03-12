import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Target, CheckCircle2 } from 'lucide-react';

const etapas = [
  {
    titulo: 'ETAPA 1 – FUNDAÇÃO DE BASE (QUÍMICA + MATEMÁTICA)',
    objetivo: 'corrigir lacunas estruturais iniciais e criar base operacional mínima.',
    conteudos: [
      { nome: 'Química Geral e Separação de Misturas (Prof. Pedro Assaad)', link: 'https://youtu.be/S5O-_kHn3W0?si=hElANE9hqOYzdk_G' },
      { nome: 'Cálculo Mental – treinamento intensivo (Prof. Pedro Assaad)', link: 'https://youtu.be/BMu0jRzrglY?si=_RJvpa3U1gMlUaaw' },
      { nome: 'Matemática do Ensino Fundamental (12 horas) (Prof. Pedro Assaad)', link: 'https://youtu.be/JQfJMJrV5Bk?si=72o1mlEQrTC49P0P' }
    ],
    obs: 'Esta etapa é propositalmente pesada. Sem base matemática e química organizada, o restante da fase perde eficiência.'
  },
  {
    titulo: 'ETAPA 2 – BIOLOGIA CELULAR + INÍCIO DE TERMOLOGIA',
    objetivo: 'estruturar base biológica e iniciar física térmica.',
    conteudos: [
      { nome: 'Citologia (Prof. Pedro Assaad)', link: 'https://youtu.be/I6XycvmojEo?si=956S8-E7Em39mHM0' },
      { nome: 'Física: Início de Termologia (Telegram -> Pedir link aos mentores)' }
    ],
    obs: 'Observação estratégica: lista de exercícios de Termologia será enviada para consolidação.'
  },
  {
    titulo: 'ETAPA 3 – FECHAMENTO DE TERMOLOGIA + ONDULATÓRIA',
    objetivo: 'consolidar física básica com foco em leitura de fenômenos.',
    conteudos: [
      { nome: 'Física: Finalização de Termologia (Prof. Pedro Assaad)' },
      { nome: 'Física: Ondulatória (Pedir aula aos mentores)' }
    ]
  },
  {
    titulo: 'ETAPA 4 – DINÂMICA + INÍCIO DO METABOLISMO ENERGÉTICO',
    objetivo: 'introduzir conteúdos fisicamente e biologicamente mais exigentes.',
    conteudos: [
      { nome: 'Dinâmica - Leis de Newton e Dinâmica (Prof. Pedro Assaad)', link: 'https://youtu.be/m4X6guWd5So?si=1BY9fVkvOi5wCkEO' },
      { nome: 'Dinâmica - Atrito (Prof. Pedro Assaad)', link: 'https://www.youtube.com/live/FTqZ-Ew8ZNM?si=MBVOW_pD67_lmbXl' },
      { nome: 'Metabolismo Energético (Pedir aula e exercícios aos mentores)' }
    ]
  },
  {
    titulo: 'ETAPA 5 – FECHAMENTO DO METABOLISMO + TABELA PERIÓDICA',
    objetivo: 'consolidar bioquímica energética e iniciar organização química.',
    conteudos: [
      { nome: 'Biologia: Fechamento do Metabolismo (Prof. Pedro Assaad)' },
      { nome: 'Química: Tabela Periódica (Prof. Pedro Assaad)' }
    ]
  },
  {
    titulo: 'ETAPA 6 – EVOLUÇÃO + ENEM 2023',
    objetivo: 'consolidar conteúdo biológico conceitual e medir desempenho real.',
    conteudos: [
      { nome: 'Biologia: Evolução (Pedir aula aos mentores)' },
      { nome: 'Resolução completa e correção da prova do ENEM 2023' }
    ],
    obs: 'A prova será usada como diagnóstico do fim da Fase 1 e base para ajustes futuros.'
  },
  {
    titulo: 'ETAPA 7 – SPRINT FINAL (LINGUAGENS + HUMANAS)',
    objetivo: 'ganho rápido de acertos e fechamento estratégico da fase.',
    conteudos: [
      { nome: 'Figuras de Linguagem (Prof. Pedro Assaad)', link: 'https://youtu.be/ekZi8MYe06g?si=MfJvkVi3IaAYBfyh' },
      { nome: 'Funções da Linguagem (Prof. Pedro Assaad)', link: 'https://youtu.be/fN-tmG-kzzw?si=uFqdu7glX_o4MaRo' },
      { nome: 'Geografia Física (Prof. Pedro Assaad)', link: 'https://youtu.be/tkn-YU7rleQ?si=HSIbhfi11bCITgX' }
    ],
    obs: 'Esta etapa funciona como sprint final da fase, com foco direto em interpretação, leitura de prova e decisão.'
  }
];

export default function NivelamentoSection() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 font-display">Ciclo Básico 1 - Nivelamento</h2>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Fase 1: Consolidação de acertos entre 125 a 135. Base para chegar em conteúdos mais difíceis.</strong><br/>
          Todos os conteúdos desta fase seguem a mesma lógica de estudo: 40% do tempo dedicado à teoria, 30% Técnica RAD, 30% resolução de questões.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etapas.map((etapa, index) => (
          <Card key={index} className="flex flex-col border-t-4 border-t-primary/80 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-2 mb-1">
                <Target className="w-5 h-5 text-primary mt-1 shrink-0" />
                <CardTitle className="text-base leading-tight">{etapa.titulo}</CardTitle>
              </div>
              <CardDescription className="text-sm font-medium text-foreground mt-2">
                Objetivo: {etapa.objetivo}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="space-y-3 flex-1">
                {etapa.conteudos.map((conteudo, i) => (
                  <div key={i} className="bg-accent/40 p-3 rounded-md border border-border">
                    <p className="text-sm font-medium flex items-start gap-2">
                       <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                       <span className="leading-tight">{conteudo.nome}</span>
                    </p>
                    {conteudo.link && (
                      <Button asChild variant="link" className="h-auto p-0 mt-2 ml-6 text-xs w-fit text-primary">
                        <a href={conteudo.link} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" /> Assistir Aula
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {etapa.obs && (
                <div className="bg-primary/10 p-3 rounded-md mt-auto border border-primary/20">
                  <p className="text-xs text-foreground italic flex gap-2">
                    <span className="text-primary font-bold">INFO:</span>
                    {etapa.obs}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
