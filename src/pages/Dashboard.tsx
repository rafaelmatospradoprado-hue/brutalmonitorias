import React, { useState, useEffect } from 'react';
import AppSidebar from '@/components/AppSidebar';
import DashboardOverview from '@/components/DashboardOverview';
import StudentsSection from '@/components/StudentsSection';
import ContentSection from '@/components/ContentSection';
import PlanejamentoSection from '@/components/PlanejamentoSection';
import SimuladosSection from '@/components/SimuladosSection';
import ProvasEnemSection from '@/components/ProvasEnemSection';
import EvolucaoSection from '@/components/EvolucaoSection';
import MentorPanel from '@/components/MentorPanel';
import MapaLacunasSection from '@/components/MapaLacunasSection';
import StudentStatusIndicator from '@/components/StudentStatusIndicator';
import RevisaoConteudoSection from '@/components/RevisaoConteudoSection';
import NivelamentoSection from '@/components/NivelamentoSection';
import QuestoesSection from '@/components/QuestoesSection';
import AssistenteRedacao from '@/components/AssistenteRedacao';
import { useTracking } from '@/hooks/useTracking';
import { getStudents } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Student } from '@/types';

export default function Dashboard() {
  const { role, studentId } = useAuth();
  const [section, setSection] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (role === 'student' && studentId) {
      setSelectedStudentId(studentId);
    }
  }, [role, studentId]);

  useTracking(section);

  const needsStudent = ['conteudos', 'planejamento', 'simulados', 'provas', 'evolucao', 'lacunas'].includes(section);

  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // Role-based section restriction
    if (role === 'student' && (section === 'alunos' || section === 'mentor')) {
      setSection('dashboard');
      return <DashboardOverview />;
    }

    if (section === 'dashboard') return <DashboardOverview />;
    if (section === 'nivelamento') return <NivelamentoSection />;
    if (section === 'alunos') return <StudentsSection onSelectStudent={setSelectedStudentId} selectedStudentId={selectedStudentId} />;
    if (section === 'mentor') return <MentorPanel />;
    if (section === 'revisao') return <RevisaoConteudoSection />;
    if (section === 'questoes') return <QuestoesSection />;
    if (section === 'redacao') return <AssistenteRedacao />;
    
    if (needsStudent && !selectedStudentId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mb-3 text-primary/50" />
          <p className="text-sm">Selecione um aluno primeiro na seção "Alunos"</p>
        </div>
      );
    }

    return (
      <>
        {selectedStudent && (
          <StudentStatusIndicator student={selectedStudent} />
        )}
        {section === 'conteudos' && selectedStudentId && <ContentSection alunoId={selectedStudentId} />}
        {section === 'planejamento' && selectedStudentId && <PlanejamentoSection alunoId={selectedStudentId} />}
        {section === 'simulados' && selectedStudentId && <SimuladosSection alunoId={selectedStudentId} />}
        {section === 'provas' && selectedStudentId && <ProvasEnemSection alunoId={selectedStudentId} />}
        {section === 'evolucao' && selectedStudentId && <EvolucaoSection alunoId={selectedStudentId} />}
        {section === 'lacunas' && selectedStudentId && <MapaLacunasSection alunoId={selectedStudentId} />}
      </>
    );
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
