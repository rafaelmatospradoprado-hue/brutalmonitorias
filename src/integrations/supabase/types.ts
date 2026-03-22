export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          nome: string
          objetivo: string | null
          acertos_iniciais: number
          acertos_atuais: number
          meta: number
          ficha_tecnica: string | null
          password: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          objetivo?: string | null
          acertos_iniciais?: number
          acertos_atuais?: number
          meta?: number
          ficha_tecnica?: string | null
          password?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          objetivo?: string | null
          acertos_iniciais?: number
          acertos_atuais?: number
          meta?: number
          ficha_tecnica?: string | null
          password?: string | null
          created_at?: string
        }
      }
      contents: {
        Row: {
          id: string
          aluno_id: string
          nome: string
          area: string
          sub_area: string | null
          incidencia: string
          teoria: boolean
          pratica: boolean
          dominio: boolean
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          nome: string
          area: string
          sub_area?: string | null
          incidencia: string
          teoria?: boolean
          pratica?: boolean
          dominio?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          nome?: string
          area?: string
          sub_area?: string | null
          incidencia?: string
          teoria?: boolean
          pratica?: boolean
          dominio?: boolean
          created_at?: string
        }
      }
      simulados: {
        Row: {
          id: string
          aluno_id: string
          numero: number
          data: string
          origem: string | null
          linguagens: number
          humanas: number
          natureza: number
          matematica: number
          dificuldade_percebida: string | null
          dificuldades_encontradas: string | null
          correcao_lacunas: boolean
          erro_lacuna_conteudo: number
          erro_desatencao: number
          erro_banal: number
          erro_conteudo_nao_estudado: number
          conteudos_com_lacuna: string | null
          questoes_ajuda: string | null
          questoes_ajuda_imagem: string | null
          acertos_pos_revisao: number
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          numero: number
          data: string
          origem?: string | null
          linguagens?: number
          humanas?: number
          natureza?: number
          matematica?: number
          dificuldade_percebida?: string | null
          dificuldades_encontradas?: string | null
          correcao_lacunas?: boolean
          erro_lacuna_conteudo?: number
          erro_desatencao?: number
          erro_banal?: number
          erro_conteudo_nao_estudado?: number
          conteudos_com_lacuna?: string | null
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
          acertos_pos_revisao?: number
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          numero?: number
          data?: string
          origem?: string | null
          linguagens?: number
          humanas?: number
          natureza?: number
          matematica?: number
          dificuldade_percebida?: string | null
          dificuldades_encontradas?: string | null
          correcao_lacunas?: boolean
          erro_lacuna_conteudo?: number
          erro_desatencao?: number
          erro_banal?: number
          erro_conteudo_nao_estudado?: number
          conteudos_com_lacuna?: string | null
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
          acertos_pos_revisao?: number
          created_at?: string
        }
      }
      provas_enem: {
        Row: {
          id: string
          aluno_id: string
          ano: number
          linguagens: number
          humanas: number
          natureza: number
          matematica: number
          dificuldade_percebida: string | null
          dificuldades_encontradas: string | null
          correcao_lacunas: boolean
          erro_lacuna_conteudo: number
          erro_desatencao: number
          erro_banal: number
          erro_conteudo_nao_estudado: number
          conteudos_com_lacuna: string | null
          questoes_ajuda: string | null
          questoes_ajuda_imagem: string | null
          acertos_pos_revisao: number
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          ano: number
          linguagens?: number
          humanas?: number
          natureza?: number
          matematica?: number
          dificuldade_percebida?: string | null
          dificuldades_encontradas?: string | null
          correcao_lacunas?: boolean
          erro_lacuna_conteudo?: number
          erro_desatencao?: number
          erro_banal?: number
          erro_conteudo_nao_estudado?: number
          conteudos_com_lacuna?: string | null
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
          acertos_pos_revisao?: number
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          ano?: number
          linguagens?: number
          humanas?: number
          natureza?: number
          matematica?: number
          dificuldade_percebida?: string | null
          dificuldades_encontradas?: string | null
          correcao_lacunas?: boolean
          erro_lacuna_conteudo?: number
          erro_desatencao?: number
          erro_banal?: number
          erro_conteudo_nao_estudado?: number
          conteudos_com_lacuna?: string | null
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
          acertos_pos_revisao?: number
          created_at?: string
        }
      }
      planejamento: {
        Row: {
          id: string
          aluno_id: string
          semana: number
          conteudos: string | null
          listas: string | null
          simulados: string | null
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          semana: number
          conteudos?: string | null
          listas?: string | null
          simulados?: string | null
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          semana?: number
          conteudos?: string | null
          listas?: string | null
          simulados?: string | null
          observacoes?: string | null
          created_at?: string
        }
      }
      mentor_obs: {
        Row: {
          id: string
          aluno_id: string
          texto: string
          data: string
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          texto: string
          data?: string
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          texto?: string
          data?: string
          created_at?: string
        }
      }
      checkpoints: {
        Row: {
          id: string
          aluno_id: string
          data: string
          foco: string | null
          dificuldades: string | null
          tarefas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          data?: string
          foco?: string | null
          dificuldades?: string | null
          tarefas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          data?: string
          foco?: string | null
          dificuldades?: string | null
          tarefas?: string | null
          created_at?: string
        }
      }
      duvidas: {
        Row: {
          id: string
          aluno_id: string
          nome_aluno: string
          titulo: string
          disciplina: string
          texto: string
          imagem_url: string | null
          status: string
          resposta: string | null
          resposta_imagem_url: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          nome_aluno: string
          titulo: string
          disciplina: string
          texto: string
          imagem_url?: string | null
          status?: string
          resposta?: string | null
          resposta_imagem_url?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          nome_aluno?: string
          titulo?: string
          disciplina?: string
          texto?: string
          imagem_url?: string | null
          status?: string
          resposta?: string | null
          resposta_imagem_url?: string | null
          responded_at?: string | null
          created_at?: string
        }
      }
      tab_records: {
        Row: {
          id: string
          aluno_id: string
          prova_ano: number
          bloco: number
          questoes: Json
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          prova_ano: number
          bloco: number
          questoes: Json
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          prova_ano?: number
          bloco?: number
          questoes?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
