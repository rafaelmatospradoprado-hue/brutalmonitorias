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
      checkpoints: {
        Row: {
          aluno_id: string
          data: string
          dificuldades: string
          foco: string
          id: string
          tarefas: string
        }
        Insert: {
          aluno_id: string
          data?: string
          dificuldades?: string
          foco?: string
          id?: string
          tarefas?: string
        }
        Update: {
          aluno_id?: string
          data?: string
          dificuldades?: string
          foco?: string
          id?: string
          tarefas?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          aluno_id: string
          area: string
          dominio: boolean
          id: string
          incidencia: string
          nome: string
          pratica: boolean
          teoria: boolean
        }
        Insert: {
          aluno_id: string
          area: string
          dominio?: boolean
          id?: string
          incidencia: string
          nome: string
          pratica?: boolean
          teoria?: boolean
        }
        Update: {
          aluno_id?: string
          area?: string
          dominio?: boolean
          id?: string
          incidencia?: string
          nome?: string
          pratica?: boolean
          teoria?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "contents_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      duvidas: {
        Row: {
          aluno_id: string
          created_at: string
          disciplina: string
          id: string
          imagem_url: string | null
          nome_aluno: string
          responded_at: string | null
          resposta: string | null
          resposta_imagem_url: string | null
          status: string
          texto: string
          titulo: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          disciplina?: string
          id?: string
          imagem_url?: string | null
          nome_aluno?: string
          responded_at?: string | null
          resposta?: string | null
          resposta_imagem_url?: string | null
          status?: string
          texto?: string
          titulo?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          disciplina?: string
          id?: string
          imagem_url?: string | null
          nome_aluno?: string
          responded_at?: string | null
          resposta?: string | null
          resposta_imagem_url?: string | null
          status?: string
          texto?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "duvidas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_observacoes: {
        Row: {
          aluno_id: string
          data: string
          id: string
          texto: string
        }
        Insert: {
          aluno_id: string
          data?: string
          id?: string
          texto: string
        }
        Update: {
          aluno_id?: string
          data?: string
          id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_observacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      planejamentos: {
        Row: {
          aluno_id: string
          conteudos: string
          id: string
          listas: string
          observacoes: string
          semana: number
          simulados_text: string
        }
        Insert: {
          aluno_id: string
          conteudos?: string
          id?: string
          listas?: string
          observacoes?: string
          semana: number
          simulados_text?: string
        }
        Update: {
          aluno_id?: string
          conteudos?: string
          id?: string
          listas?: string
          observacoes?: string
          semana?: number
          simulados_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "planejamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      provas_enem: {
        Row: {
          acertos_pos_revisao: number | null
          aluno_id: string
          ano: number
          conteudos_com_lacuna: string | null
          correcao_lacunas: boolean
          dificuldade_percebida: string
          dificuldades_encontradas: string
          erro_banal: number | null
          erro_conteudo_nao_estudado: number | null
          erro_desatencao: number | null
          erro_lacuna_conteudo: number | null
          humanas: number
          id: string
          linguagens: number
          matematica: number
          natureza: number
          questoes_ajuda: string | null
          questoes_ajuda_imagem: string | null
        }
        Insert: {
          acertos_pos_revisao?: number | null
          aluno_id: string
          ano: number
          conteudos_com_lacuna?: string | null
          correcao_lacunas?: boolean
          dificuldade_percebida?: string
          dificuldades_encontradas?: string
          erro_banal?: number | null
          erro_conteudo_nao_estudado?: number | null
          erro_desatencao?: number | null
          erro_lacuna_conteudo?: number | null
          humanas?: number
          id?: string
          linguagens?: number
          matematica?: number
          natureza?: number
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
        }
        Update: {
          acertos_pos_revisao?: number | null
          aluno_id?: string
          ano?: number
          conteudos_com_lacuna?: string | null
          correcao_lacunas?: boolean
          dificuldade_percebida?: string
          dificuldades_encontradas?: string
          erro_banal?: number | null
          erro_conteudo_nao_estudado?: number | null
          erro_desatencao?: number | null
          erro_lacuna_conteudo?: number | null
          humanas?: number
          id?: string
          linguagens?: number
          matematica?: number
          natureza?: number
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provas_enem_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      simulados: {
        Row: {
          acertos_pos_revisao: number | null
          aluno_id: string
          conteudos_com_lacuna: string | null
          correcao_lacunas: boolean
          data: string
          dificuldade_percebida: string
          dificuldades_encontradas: string
          erro_banal: number | null
          erro_conteudo_nao_estudado: number | null
          erro_desatencao: number | null
          erro_lacuna_conteudo: number | null
          humanas: number
          id: string
          linguagens: number
          matematica: number
          natureza: number
          numero: number
          origem: string
          questoes_ajuda: string | null
          questoes_ajuda_imagem: string | null
        }
        Insert: {
          acertos_pos_revisao?: number | null
          aluno_id: string
          conteudos_com_lacuna?: string | null
          correcao_lacunas?: boolean
          data?: string
          dificuldade_percebida?: string
          dificuldades_encontradas?: string
          erro_banal?: number | null
          erro_conteudo_nao_estudado?: number | null
          erro_desatencao?: number | null
          erro_lacuna_conteudo?: number | null
          humanas?: number
          id?: string
          linguagens?: number
          matematica?: number
          natureza?: number
          numero?: number
          origem?: string
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
        }
        Update: {
          acertos_pos_revisao?: number | null
          aluno_id?: string
          conteudos_com_lacuna?: string | null
          correcao_lacunas?: boolean
          data?: string
          dificuldade_percebida?: string
          dificuldades_encontradas?: string
          erro_banal?: number | null
          erro_conteudo_nao_estudado?: number | null
          erro_desatencao?: number | null
          erro_lacuna_conteudo?: number | null
          humanas?: number
          id?: string
          linguagens?: number
          matematica?: number
          natureza?: number
          numero?: number
          origem?: string
          questoes_ajuda?: string | null
          questoes_ajuda_imagem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulados_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          acertos_atuais: number
          acertos_iniciais: number
          created_at: string
          id: string
          meta: number
          nome: string
          objetivo: string
        }
        Insert: {
          acertos_atuais?: number
          acertos_iniciais?: number
          created_at?: string
          id?: string
          meta?: number
          nome: string
          objetivo?: string
        }
        Update: {
          acertos_atuais?: number
          acertos_iniciais?: number
          created_at?: string
          id?: string
          meta?: number
          nome?: string
          objetivo?: string
        }
        Relationships: []
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
