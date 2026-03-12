
-- Students table
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  objetivo text NOT NULL DEFAULT '',
  acertos_iniciais integer NOT NULL DEFAULT 0,
  acertos_atuais integer NOT NULL DEFAULT 0,
  meta integer NOT NULL DEFAULT 150,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Contents table
CREATE TABLE public.contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  area text NOT NULL,
  incidencia text NOT NULL,
  teoria boolean NOT NULL DEFAULT false,
  pratica boolean NOT NULL DEFAULT false,
  dominio boolean NOT NULL DEFAULT false
);
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.contents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Simulados table
CREATE TABLE public.simulados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  numero integer NOT NULL DEFAULT 1,
  data text NOT NULL DEFAULT '',
  origem text NOT NULL DEFAULT '',
  linguagens integer NOT NULL DEFAULT 0,
  humanas integer NOT NULL DEFAULT 0,
  natureza integer NOT NULL DEFAULT 0,
  matematica integer NOT NULL DEFAULT 0,
  dificuldade_percebida text NOT NULL DEFAULT '',
  dificuldades_encontradas text NOT NULL DEFAULT '',
  correcao_lacunas boolean NOT NULL DEFAULT false,
  erro_lacuna_conteudo integer DEFAULT 0,
  erro_desatencao integer DEFAULT 0,
  erro_banal integer DEFAULT 0,
  erro_conteudo_nao_estudado integer DEFAULT 0,
  conteudos_com_lacuna text DEFAULT '',
  questoes_ajuda text DEFAULT '',
  questoes_ajuda_imagem text DEFAULT '',
  acertos_pos_revisao integer DEFAULT NULL
);
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.simulados FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Provas ENEM table
CREATE TABLE public.provas_enem (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  ano integer NOT NULL,
  linguagens integer NOT NULL DEFAULT 0,
  humanas integer NOT NULL DEFAULT 0,
  natureza integer NOT NULL DEFAULT 0,
  matematica integer NOT NULL DEFAULT 0,
  dificuldade_percebida text NOT NULL DEFAULT '',
  dificuldades_encontradas text NOT NULL DEFAULT '',
  correcao_lacunas boolean NOT NULL DEFAULT false,
  erro_lacuna_conteudo integer DEFAULT 0,
  erro_desatencao integer DEFAULT 0,
  erro_banal integer DEFAULT 0,
  erro_conteudo_nao_estudado integer DEFAULT 0,
  conteudos_com_lacuna text DEFAULT '',
  questoes_ajuda text DEFAULT '',
  questoes_ajuda_imagem text DEFAULT '',
  acertos_pos_revisao integer DEFAULT NULL
);
ALTER TABLE public.provas_enem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.provas_enem FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Planejamentos table
CREATE TABLE public.planejamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  semana integer NOT NULL,
  conteudos text NOT NULL DEFAULT '',
  listas text NOT NULL DEFAULT '',
  simulados_text text NOT NULL DEFAULT '',
  observacoes text NOT NULL DEFAULT '',
  UNIQUE(aluno_id, semana)
);
ALTER TABLE public.planejamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.planejamentos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Mentor observacoes table
CREATE TABLE public.mentor_observacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  texto text NOT NULL,
  data timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_observacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.mentor_observacoes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Checkpoints table
CREATE TABLE public.checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  data timestamptz NOT NULL DEFAULT now(),
  foco text NOT NULL DEFAULT '',
  dificuldades text NOT NULL DEFAULT '',
  tarefas text NOT NULL DEFAULT ''
);
ALTER TABLE public.checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.checkpoints FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Duvidas table
CREATE TABLE public.duvidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  nome_aluno text NOT NULL DEFAULT '',
  titulo text NOT NULL DEFAULT '',
  disciplina text NOT NULL DEFAULT '',
  texto text NOT NULL DEFAULT '',
  imagem_url text DEFAULT NULL,
  status text NOT NULL DEFAULT 'pendente',
  resposta text DEFAULT NULL,
  resposta_imagem_url text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz DEFAULT NULL
);
ALTER TABLE public.duvidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON public.duvidas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
