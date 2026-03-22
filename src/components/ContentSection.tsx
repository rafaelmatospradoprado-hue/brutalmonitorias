import React, { useState, useEffect } from 'react';
import { ContentItem } from '@/types';
import { getContents, toggleContent, initContentForStudent } from '@/lib/store';
import { contentTemplate } from '@/data/contentTemplate';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface Props { alunoId: string; }

const areaColors: Record<string, string> = {
  'Linguagens': 'bg-blue-900/30 text-blue-300 border-blue-800',
  'Humanas': 'bg-amber-900/30 text-amber-300 border-border',
  'Natureza': 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
  'Matemática': 'bg-purple-900/30 text-purple-300 border-purple-800',
};

const incidenciaColors: Record<string, string> = {
  'obrigatório': 'bg-primary/20 text-primary border-primary/40',
  'alta': 'bg-emerald-900/30 text-emerald-300 border-emerald-700',
  'média': 'bg-amber-900/30 text-amber-300 border-amber-700',
  'baixa': 'bg-red-900/30 text-red-300 border-red-700',
};

export default function ContentSection({ alunoId }: Props) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await getContents(alunoId);
      setItems(data);
    } catch (err) {
      console.error('Erro ao buscar conteúdos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await initContentForStudent(alunoId, contentTemplate);
      await refresh();
    };
    init();
  }, [alunoId]);

  const handleToggle = async (id: string, field: 'teoria' | 'pratica' | 'dominio') => {
    try {
      await toggleContent(id, field);
      await refresh();
    } catch (err) {
      console.error('Erro ao alternar conteúdo:', err);
    }
  };

  const areas: ('Linguagens' | 'Humanas' | 'Natureza' | 'Matemática')[] = ['Matemática', 'Natureza', 'Humanas', 'Linguagens'];

  const getStats = (area: string) => {
    const areaItems = items.filter(i => i.area === area);
    const total = areaItems.length;
    const done = areaItems.filter(i => i.teoria && i.pratica && i.dominio).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl text-primary mb-4">CONTEÚDOS</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {areas.map(area => {
          const stats = getStats(area);
          return (
            <div key={area} className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground">{area}</p>
              <p className="font-display text-lg text-foreground">{stats.done}/{stats.total}</p>
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${stats.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="Matemática">
        <TabsList className="bg-card border border-border mb-4 flex-wrap h-auto">
          {areas.map(a => <TabsTrigger key={a} value={a} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs">{a}</TabsTrigger>)}
        </TabsList>
        {areas.map(area => (
          <TabsContent key={area} value={area}>
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_80px_60px_60px_60px] gap-2 text-xs text-muted-foreground px-3 py-2 border-b border-border/50">
                <span>Conteúdo</span><span>Incidência</span><span className="text-center">Teoria</span><span className="text-center">Prática</span><span className="text-center">Domínio</span>
              </div>
              
              {area === 'Natureza' ? (
                ['Biologia', 'Física', 'Química'].map(sub => {
                  const subItems = items.filter(i => i.area === 'Natureza' && i.subArea === sub);
                  if (subItems.length === 0) return null;
                  return (
                    <div key={sub} className="space-y-1">
                      <h3 className="text-[10px] font-display text-primary px-3 uppercase tracking-widest mt-4 mb-2">{sub}</h3>
                      {subItems.map(item => (
                        <div key={item.id} className="grid grid-cols-[1fr_80px_60px_60px_60px] gap-2 items-center px-3 py-2 rounded bg-card/50 border border-border/50 hover:border-primary/20 transition-colors">
                          <span className="text-sm text-foreground">{item.nome}</span>
                          <Badge variant="outline" className={`text-[10px] ${incidenciaColors[item.incidencia]}`}>{item.incidencia}</Badge>
                          <div className="flex justify-center"><Checkbox checked={item.teoria} onCheckedChange={() => handleToggle(item.id, 'teoria')} /></div>
                          <div className="flex justify-center"><Checkbox checked={item.pratica} onCheckedChange={() => handleToggle(item.id, 'pratica')} /></div>
                          <div className="flex justify-center"><Checkbox checked={item.dominio} onCheckedChange={() => handleToggle(item.id, 'dominio')} /></div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                items.filter(i => i.area === area).map(item => (
                  <div key={item.id} className="grid grid-cols-[1fr_80px_60px_60px_60px] gap-2 items-center px-3 py-1.5 rounded bg-card/50 border border-border/50 hover:border-primary/20 transition-colors">
                    <span className="text-sm text-foreground">{item.nome}</span>
                    <Badge variant="outline" className={`text-[10px] ${incidenciaColors[item.incidencia]}`}>{item.incidencia}</Badge>
                    <div className="flex justify-center"><Checkbox checked={item.teoria} onCheckedChange={() => handleToggle(item.id, 'teoria')} /></div>
                    <div className="flex justify-center"><Checkbox checked={item.pratica} onCheckedChange={() => handleToggle(item.id, 'pratica')} /></div>
                    <div className="flex justify-center"><Checkbox checked={item.dominio} onCheckedChange={() => handleToggle(item.id, 'dominio')} /></div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
