---
description: Regras e boas práticas para criação de componentes no Next.js utilizando Shadcn UI, Tailwind CSS e CVA
globs: **/*.tsx, **/*.jsx
---

# 🚀 Diretrizes para Componentes: Next.js, Shadcn UI, Tailwind & CVA

Você é um especialista no ecossistema moderno do Next.js. Siga estritamente as regras abaixo ao criar ou refatorar componentes no projeto.

---

## 🎯 1. Princípios Gerais e Nomenclatura
* **Funções Descritivas e Contextuais:** Dê nomes de funções que deixem claro **exatamente o que elas fazem no contexto do negócio**. Evite nomes genéricos como `handleClick` ou `processData`.
  * ❌ `handleClick()` ➔ ✅ `handleConfirmPurchase()` ou `handleDeleteAccount()`
  * ❌ `getData()` ➔ ✅ `fetchActiveUserSubscriptions()`
* **Booleanos com Prefixos:** Utilize prefixos como `is`, `has`, `should` ou `can` para estados e flags lógicas.
  * ❌ `loading`, `error` ➔ ✅ `isLoading`, `hasError`
* **Nome de Arquivos:** Mantenha o padrão `kebab-case` para diretórios e arquivos.
  * ❌ `UserProfileCard.tsx` ➔ ✅ `user-profile-card.tsx`

---

## 🎨 2. Variantes com CVA e Estilização Tailwind
* **CVA para Gerenciamento de Variantes:** Utilize `class-variance-authority` (CVA) para criar variações visuais e de tamanho (substituindo a antiga interpolação do *Styled Components* por uma matriz declarativa).
* **Escopo do CVA:** Aplique CVA em componentes reutilizáveis ou pequenos (ex: botões, badges, cards atômicos, inputs).
* **PROIBIDO Valores Hardcoded:** Nunca utilize cores fixas ou tamanhos arbitrários em CSS/Tailwind (ex: `bg-[#1a1a1a]`, `text-[#333]`).
* **Respeite as Variáveis do Tema (Shadcn UI):** Utilize **sempre** variáveis semânticas para suporte automático a Dark/Light mode.
  * ❌ `bg-white text-black` ➔ ✅ `bg-background text-foreground`
  * ❌ `border-gray-200` ➔ ✅ `border-border`
  * ❌ `text-gray-500` ➔ ✅ `text-muted-foreground`
* **Uso Obrigatório de `cn()`:** Toda propriedade de estilo estendido ou classe condicional deve passar pela função utilitária `cn()`.

---

## 🛠️ 3. Arquitetura Next.js (App Router)
* **Server Components por Padrão (RSC First):** Mantenha o componente como Server Component a menos que ele precise explicitamente de interatividade no cliente.
* **Uso Consciente do `'use client'`:** Adicione a diretiva `'use client'` **apenas** no menor nó possível da árvore de componentes.
* **Guard Clauses (Retornos Antecipados):** Trate estados de carregamento, erro ou valores nulos no início da função para manter o código limpo.

---

## 🔒 4. Tipagem TypeScript
* **Extensão de Props com CVA:** Ao utilizar CVA, combine os atributos HTML nativos com `VariantProps<typeof suafuncaoVariants>`.
* **Valores Padrão:** O próprio CVA deve definir os `defaultVariants`, e o componente deve usar *destructuring* para props opcionais.

---

## 📝 Exemplo Prático: Componente com Variantes CVA

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 1. Definição das variantes visuais com CVA usando classes semânticas do tema
const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      status: {
        success:
          'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
        warning:
          'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400',
        error:
          'border-transparent bg-destructive/15 text-destructive',
        info:
          'border-transparent bg-primary/15 text-primary',
        neutral:
          'border-border bg-muted text-muted-foreground',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      status: 'neutral',
      size: 'md',
    },
  }
)

// 2. Tipagem combinando atributos HTML de 'span' + Tipagem do CVA
export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  badgeLabel: string
  isDotVisible?: boolean
}

/**
 * Componente pequeno e atômico para exibição de status com variantes CVA.
 */
export function StatusBadge({
  badgeLabel,
  status,
  size,
  isDotVisible = true,
  className,
  ...props
}: StatusBadgeProps) {
  // Guard clause para evitar renderização sem texto
  if (!badgeLabel) return null

  return (
    <span
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {isDotVisible && (
        <span
          className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {badgeLabel}
    </span>
  )
}