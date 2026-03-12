Design system, constraints, and architecture for Performance Brutal ENEM platform.

## Colors (HSL)
- Background: 150 30% 4% (#0B0F0C black)
- Card: 155 30% 7%
- Primary (gold): 43 76% 52% (#D4AF37)
- Gold light: 40 70% 87% (#F2E8C9)
- Green military: 155 30% 20% (#1E3A2F)
- Green dark: 155 30% 10% (#14251D)

## Fonts
- Display: Oswald (headings)
- Body: Inter

## Auth
- Simple password login: "Dana andar" (sessionStorage)
- No email/user system

## Architecture
- Single-page dashboard with sidebar navigation
- **Data persisted in Lovable Cloud database** (migrated from localStorage)
- React Query hooks in src/hooks/useSupabaseData.ts
- DB tables: students, contents, simulados, provas_enem, planejamentos, mentor_observacoes, checkpoints, duvidas
- Permissive RLS (no user auth system)
- Column naming: snake_case in DB, camelCase in TypeScript (mapped in hooks)
- Planejamentos uses upsert with UNIQUE(aluno_id, semana)
- Planejamentos column: simulados_text (maps to TS field: simulados)

## Brand
- Logo at: src/assets/logo_brutal.jpeg
- Military strategic command center aesthetic
