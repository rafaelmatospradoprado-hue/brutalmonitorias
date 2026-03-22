import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('Inserindo Maria Rita...');
  const { data, error } = await supabase.from('students').insert([
    { 
      nome: 'Maria Rita', 
      objetivo: 'Medicina', 
      acertos_iniciais: 120, 
      acertos_atuais: 135, 
      meta: 160, 
      password: 'senha' 
    }
  ]).select();

  if (error) console.error('Erro ao inserir aluno:', error);
  else console.log('Aluno inserido com sucesso:', data);
  process.exit();
}

seed();
