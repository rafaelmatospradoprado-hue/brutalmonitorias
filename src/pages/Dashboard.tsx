import React, { useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import DashboardOverview from '@/components/DashboardOverview';
import StudentsSection from '@/components/StudentsSection';
import ContentSection from '@/components/ContentSection';
import PlanejamentoSection from '@/components/PlanejamentoSection';
import SimuladosSection from '@/components/SimuladosSection';
import ProvasEnemSection from '@/components/ProvasEnemSection';
import EvolucaoSection from '@/components/EvolucaoSection';
import MentorPanel from '@/components/MentorPanel';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [section, setSection] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const needsStudent = ['conteudos', 'planejamento', 'simulados', 'provas', 'evolucao'].includes(section);

  const renderContent = () => {
    if (section === 'dashboard') return <DashboardOverview />;
    if (section === 'alunos') return <StudentsSection onSelectStudent={setSelectedStudentId} selectedStudentId={selectedStudentId} />;
    if (section === 'mentor') return <MentorPanel />;
    
    if (needsStudent && !selectedStudentId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-3 text-primary/50" />
          <p className="text-sm">Selecione um aluno primeiro na seção "Alunos"</p>
        </div>
      );
    }

    if (section === 'conteudos' && selectedStudentId) return <ContentSection alunoId={selectedStudentId} />;
    if (section === 'planejamento' && selectedStudentId) return <PlanejamentoSection alunoId={selectedStudentId} />;
    if (section === 'simulados' && selectedStudentId) return <SimuladosSection alunoId={selectedStudentId} />;
    if (section === 'provas' && selectedStudentId) return <ProvasEnemSection alunoId={selectedStudentId} />;
    if (section === 'evolucao' && selectedStudentId) return <EvolucaoSection alunoId={selectedStudentId} />;

    return null;
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar activeSection={section} onNavigate={setSection} />
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
