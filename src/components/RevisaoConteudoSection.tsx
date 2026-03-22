import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, BookOpen, PenTool, Calculator, Youtube } from 'lucide-react';

export default function RevisaoConteudoSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 font-display">Revisão de Conteúdo</h2>
        <p className="text-muted-foreground">
          Aulas estratégicas para revisão, correção de lacunas e resolução de provas do ENEM.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Card 1 — Revisão Geral */}
        <Card className="border-l-4 border-l-primary/80 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-primary" />
              <CardTitle>Revisão Geral (Avançado)</CardTitle>
            </div>
            <CardDescription className="text-base mt-2">
              Aulas de revisão geral indicadas para alunos avançados que já estudaram os conteúdos e querem revisar os principais temas cobrados no ENEM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Matemática — Revisão Completa</h4>
                <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/_EmywnyCOM0" 
                    title="Matemática" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="border-0"
                  ></iframe>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Física — Revisão Completa</h4>
                <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/M58XvuZ4Zy8" 
                    title="Física" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="border-0"
                  ></iframe>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Biologia — Revisão Completa</h4>
                <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/rfvBCtd2VNE" 
                    title="Biologia" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="border-0"
                  ></iframe>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 2 — Cálculo Comigo */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <CardTitle>Cálculo Comigo</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Conteúdo essencial de matemática. Esse material é considerado base fundamental para o desempenho em matemática no ENEM.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="bg-accent/50 p-3 rounded-md mb-4">
                <p className="text-xs font-medium">Recomendação pedagógica:</p>
                <p className="text-xs text-muted-foreground">Assistir regularmente, preferencialmente um pouco todos os dias.</p>
              </div>
              <Button asChild className="w-full gap-2">
                <a href="https://youtube.com/playlist?list=PLrZe9p7Ii567PXoha95iq2VhCuycweebG" target="_blank" rel="noreferrer">
                  <PlayCircle className="w-4 h-4" />
                  Assistir Playlist
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Card 3 — Estudo Comigo */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Estudo Comigo</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Sessões de estudo acompanhadas ideais para alunos intermediários revisarem conteúdos de várias matérias. Ajuda na constância de estudo e revisão geral.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Button asChild variant="outline" className="w-full gap-2 mt-4">
                <a href="https://youtube.com/playlist?list=PLrZe9p7Ii564JiaQz1xs41tmEzUHjHY6j" target="_blank" rel="noreferrer">
                  <PlayCircle className="w-4 h-4" />
                  Assistir Playlist
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Card 4 — Redação */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                <CardTitle>Redação</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Análise e reconstrução de redações do ENEM feita por Pedro Assad e Mila Borges.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="bg-accent/50 p-3 rounded-md mb-4 space-y-1">
                <p className="text-xs font-medium">Indicado para melhorar:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside pl-4">
                  <li>Argumentação</li>
                  <li>Estrutura</li>
                  <li>Repertório</li>
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full gap-2">
                <a href="https://youtube.com/playlist?list=PLrZe9p7Ii5653pXRhPB24v468whO_wixo" target="_blank" rel="noreferrer">
                  <PlayCircle className="w-4 h-4" />
                  Assistir Playlist
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Card 5 — Resolução de Provas */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Resolução de Provas do ENEM</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Resolução detalhada de provas do ENEM.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="bg-accent/50 p-3 rounded-md mb-4 space-y-1">
                <p className="text-xs font-medium">Recomendado para:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside pl-4">
                  <li>Aprender estratégia de prova</li>
                  <li>Revisar conteúdos aplicados</li>
                  <li>Entender o raciocínio das questões</li>
                </ul>
              </div>
              <Button asChild variant="outline" className="w-full gap-2">
                <a href="https://youtube.com/playlist?list=PLnaeWF77lT3LWjtU2VpoBH4b6ItJgcrpF" target="_blank" rel="noreferrer">
                  <PlayCircle className="w-4 h-4" />
                  Assistir Playlist
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
