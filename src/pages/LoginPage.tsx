import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo_brutal.jpeg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    
    setLoading(true);
    const success = await login(userName, password);
    setLoading(false);

    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Brutal Monitorias" className="w-32 h-32 rounded-lg mb-6 border-2 border-primary/30" />
          <h1 className="font-display text-3xl tracking-wider text-primary">PERFORMANCE BRUTAL</h1>
          <p className="text-muted-foreground text-sm mt-1">Painel Estratégico de Evolução ENEM</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Seu nome"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="pl-10 bg-card border-border focus:ring-primary"
              required
              disabled={loading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-card border-border focus:ring-primary"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-destructive text-sm text-center">Credenciais inválidas</p>}
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            ACESSAR SISTEMA
          </Button>
        </form>
        <p className="text-center text-muted-foreground text-xs mt-6">Método. Disciplina. Resultado.</p>
      </div>
    </div>
  );
}
