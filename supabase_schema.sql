-- Tabelas para o Brutal Monitorias

-- 1. Alunos
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  objetivo TEXT,
  password TEXT NOT NULL DEFAULT 'Dana andar',
  acertos_iniciais INTEGER DEFAULT 0,
  acertos_atuais INTEGER DEFAULT 0,
  meta INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  ficha_tecnica TEXT
);

-- 2. Conteúdos
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  area TEXT NOT NULL,
  sub_area TEXT,
  incidencia TEXT,
  teoria BOOLEAN DEFAULT false,
  pratica BOOLEAN DEFAULT false,
  dominio BOOLEAN DEFAULT false
);

-- 3. Simulados
CREATE TABLE simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  numero INTEGER,
  data DATE,
  origem TEXT,
  linguagens INTEGER DEFAULT 0,
  humanas INTEGER DEFAULT 0,
  natureza INTEGER DEFAULT 0,
  matematica INTEGER DEFAULT 0,
  dificuldade_percebida TEXT,
  dificuldades_encontradas TEXT,
  correcao_lacunas BOOLEAN DEFAULT false,
  erro_lacuna_conteudo INTEGER DEFAULT 0,
  erro_desatencao INTEGER DEFAULT 0,
  erro_banal INTEGER DEFAULT 0,
  erro_conteudo_nao_estudado INTEGER DEFAULT 0,
  conteudos_com_lacuna TEXT,
  questoes_ajuda TEXT,
  questoes_ajuda_imagem TEXT,
  acertos_pos_revisao INTEGER DEFAULT 0
);

-- 4. Provas ENEM
CREATE TABLE provas_enem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  ano INTEGER,
  linguagens INTEGER DEFAULT 0,
  humanas INTEGER DEFAULT 0,
  natureza INTEGER DEFAULT 0,
  matematica INTEGER DEFAULT 0,
  dificuldade_percebida TEXT,
  dificuldades_encontradas TEXT,
  correcao_lacunas BOOLEAN DEFAULT false,
  erro_lacuna_conteudo INTEGER DEFAULT 0,
  erro_desatencao INTEGER DEFAULT 0,
  erro_banal INTEGER DEFAULT 0,
  erro_conteudo_nao_estudado INTEGER DEFAULT 0,
  conteudos_com_lacuna TEXT,
  questoes_ajuda TEXT,
  questoes_ajuda_imagem TEXT,
  acertos_pos_revisao INTEGER DEFAULT 0
);

-- 5. Planejamento
CREATE TABLE planejamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  semana INTEGER,
  conteudos TEXT,
  listas TEXT,
  simulados TEXT,
  observacoes TEXT
);

-- 6. Observações do Mentor
CREATE TABLE mentor_obs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  texto TEXT,
  data TIMESTAMPTZ DEFAULT now()
);

-- 7. Checkpoints Semanais
CREATE TABLE checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  data TIMESTAMPTZ DEFAULT now(),
  foco TEXT,
  dificuldades TEXT,
  tarefas TEXT
);

-- 8. Dúvidas
CREATE TABLE duvidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  nome_aluno TEXT,
  titulo TEXT,
  disciplina TEXT,
  texto TEXT,
  imagem_url TEXT,
  status TEXT DEFAULT 'pendente',
  resposta TEXT,
  resposta_imagem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- 9. TAB Records (Mapa de Lacunas)
CREATE TABLE tab_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES students(id) ON DELETE CASCADE,
  prova_ano INTEGER,
  bloco INTEGER,
  questoes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS habilitado (Políticas Básicas de Acesso)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Access" ON students FOR SELECT USING (true);
CREATE POLICY "Full Admin Access" ON students FOR ALL USING (true);
-- Nota: Para um ambiente de produção real, as políticas devem ser mais restritivas.
-- Mas como o usuário pediu algo rápido, vamos permitir acesso total via service_role ou anon_key sem restrições complexas por enquanto.
