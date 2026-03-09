import React, { useState } from 'react';
import logo from '@/assets/logo_brutal.jpeg';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, BookOpen, Calendar, ClipboardList, Award, TrendingUp, LogOut, Shield, MapPin, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alunos', label: 'Alunos', icon: Users },
  { id: 'conteudos', label: 'Conteúdos', icon: BookOpen },
  { id: 'planejamento', label: 'Planejamento', icon: Calendar },
  { id: 'simulados', label: 'Simulados', icon: ClipboardList },
  { id: 'provas', label: 'Provas ENEM', icon: Award },
  { id: 'evolucao', label: 'Evolução', icon: TrendingUp },
  { id: 'lacunas', label: 'Mapa de Lacunas', icon: MapPin },
  { id: 'revisao', label: 'Revisão', icon: PlayCircle },
  { id: 'mentor', label: 'Painel Mentor', icon: Shield },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function AppSidebar({ activeSection, onNavigate }: SidebarProps) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen sticky top-0 flex flex-col border-r border-border bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className="flex items-center gap-3 p-4 border-b border-border cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <img src={logo} alt="Brutal" className="w-9 h-9 rounded-md flex-shrink-0" />
        {!collapsed && <span className="font-display text-sm text-primary tracking-wider">BRUTAL</span>}
      </div>

      <nav className="flex-1 py-2 space-y-0.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              activeSection === item.id
                ? "bg-accent text-primary border-r-2 border-primary"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive border-t border-border transition-colors"
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>Sair</span>}
      </button>
    </aside>
  );
}
