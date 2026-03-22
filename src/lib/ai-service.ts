export async function corrigirRedacao(textoEnviado: string, imageUrl?: string): Promise<string> {
  // TODO: Integrar com a API real (OpenAI/Gemini/Claude)
  // Por enquanto, retorna um resultado fake (mock) para o usuário validar a UI
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
# CORREÇÃO BRUTAL DA SUA REDAÇÃO

**Nota Final Projetada:** 840

---

## COMPETÊNCIA 1: Domínio da Modalidade Escrita Formal da Língua Portuguesa
**Nota:** 160 (Você demonstrou bom domínio, mas há desvios de regência e pontuação).

**Erros Encontrados e Como Corrigir:**
1. **Erro de vírgula (linha 4):** "A tecnologia embora avançada, não resolve..."
   - *Correção Brutal:* "A tecnologia, embora avançada, não resolve..." (Faltou a vírgula dupla para isolar a oração interferente).
2. **Erro de concordância (linha 12):** "Falta investimentos na base..."
   - *Correção Brutal:* "Faltam investimentos na base..." (O verbo deve concordar com o sujeito no plural).

---

## COMPETÊNCIA 2: Compreensão da Proposta e Repertório
**Nota:** 160

*Seu repertório sobre Bauman foi bem aplicado (Modernidade Líquida), mas faltou conectar diretamente à realidade brasileira imposta pelo tema.*

---

## COMPETÊNCIA 3: Seleção e Organização de Argumentos
**Nota:** 160

*Você levanta dois bons argumentos na introdução, mas o segundo parágrafo de desenvolvimento foge do ponto principal. Foque em defender a tese.*

---

## COMPETÊNCIA 4: Coesão e Mecanismos Lingüísticos
**Nota:** 200

*Excelente uso de conectivos inter e intraparagrafais! O uso de "Por conseguinte" e "Nesse viés" foi perfeito.*

---

## COMPETÊNCIA 5: Proposta de Intervenção
**Nota:** 160

*Você apresentou Agente, Ação, Modo/Meio e Efeito. Porém, faltou o DETALHAMENTO da ação. Quem exatamente no Ministério da Educação fará isso? Como? Detalhe mais da próxima vez.*

---

**Resumo Brutal:** Sua escrita tem muito potencial. Pare de perder pontos bestas com vírgula e detalhe melhor a sua proposta de intervenção. Treine mais!
      `);
    }, 2500); // 2.5 seconds to simulate API delay
  });
}
