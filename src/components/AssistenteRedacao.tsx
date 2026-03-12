import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, PenTool, ImagePlus, Loader2, RefreshCw } from 'lucide-react';
import { corrigirRedacao } from '@/lib/ai-service';

export default function AssistenteRedacao() {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const handleCorrigir = async () => {
    if (!texto.trim()) return;
    setLoading(true);
    setResultado(null);
    try {
      const response = await corrigirRedacao(texto);
      setResultado(response);
    } catch (error) {
      console.error(error);
      setResultado('Ocorreu um erro ao conectar com o Assistente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTexto('');
    setResultado(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-primary">ASSISTENTE DE REDAÇÃO IA</h2>
          <p className="text-sm text-muted-foreground">O seu avaliador brutal para o ENEM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Esquerda: Entrada */}
        <Card className="bg-card border-border h-fit">
          <CardHeader>
            <CardTitle className="font-display text-lg">Enviar Redação</CardTitle>
            <CardDescription>Cole sua redação digitada ou faça o upload da foto da folha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Cole o texto da sua redação aqui..." 
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="min-h-[300px] bg-background border-border text-sm resize-none"
              disabled={loading}
            />
            
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" className="text-muted-foreground w-1/2" disabled={loading}>
                <ImagePlus className="h-4 w-4 mr-2" />
                Upload de Foto
              </Button>
              <Button 
                className="w-1/2 bg-primary text-primary-foreground" 
                onClick={handleCorrigir}
                disabled={loading || (!texto.trim())}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PenTool className="h-4 w-4 mr-2" />}
                Corrigir Agora
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Direita: Resultado */}
        <Card className="bg-card border-border transition-all h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-display text-lg">Avaliação do Corretor</CardTitle>
              <CardDescription>Critérios baseados nas 5 competências.</CardDescription>
            </div>
            {resultado && (
              <Button variant="ghost" size="icon" onClick={handleReset} title="Nova correção">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 p-4 flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                <p className="animate-pulse text-sm">O corretor brutal está lendo seu texto...</p>
              </div>
            ) : resultado ? (
              <div className="prose prose-sm dark:prose-invert max-w-none 
                prose-h1:text-primary prose-h1:font-display prose-h1:text-xl
                prose-h2:text-accent-foreground prose-h2:font-medium prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2
                p-4 bg-background rounded-md border border-border whitespace-pre-wrap text-sm">
                {resultado}
              </div>
            ) : (
               <div className="min-h-[300px] flex items-center justify-center p-4 border border-dashed border-border rounded-md bg-background/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Aguardando envio da redação.<br/>A correção aparecerá aqui em detalhes.
                  </p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
