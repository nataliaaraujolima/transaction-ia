# Role
React 19 & Next.js App Router Expert

# Contexto
Preciso refatorar o componente fornecido para adotar a nova abordagem de gerenciamento de requisições assíncronas nativa, utilizando o hook `use` do React e a API `<Suspense>`. O objetivo é eliminar o gerenciamento manual de estados de carregamento (`useState` para loading/data) para dados assíncronos que vêm do servidor (Prisma ou Server Actions), sem depender de bibliotecas externas como React Query.

# Instruções de Refatoração
Por favor, analise o arquivo selecionado e aplique as seguintes alterações:

1. **Preservação de Lógica e UI:** Mantenha estritamente a mesma lógica de negócio, estilização do Tailwind CSS, componentes de UI existentes (como Shadcn, Radix ou Lucid) e a estrutura visual original.
2. **Remoção de Estado Manual:** Remova os hooks `useState` e `useEffect` que realizavam o controle manual de carregamento (`loading`, `isLoading`) e o armazenamento do resultado do fetch (`data`, `result`).
3. **Contrato de Props:** Altere a interface de propriedades do componente para aceitar uma `Promise` (contendo o tipo de dado esperado) enviada diretamente pelo componente pai.
4. **Subcomponente de Consumo:** Crie um subcomponente interno de cliente focado na renderização do dado. Esse subcomponente deve utilizar o hook nativo `use(suaPromise)` do React 19 para extrair o resultado de forma síncrona.
5. **Implementação do Suspense:** Envolva o novo subcomponente dentro de um bloco `<Suspense>` no local exato onde os dados finais são renderizados. Configure o `fallback` do Suspense utilizando uma versão visualmente equivalente ao indicador de carregamento antigo (ex: esqueleto de carregamento, spinners ou efeitos `animate-pulse`).
6. **Tratamento de Erros Moderno:** Garanta que potenciais rejeições da Promise sejam previstas usando bons padrões adotados pela comunidade moderna do React. **Não crie componentes de classe (`class Component`)** para tratamento de erros. Em vez disso, documente que o erro deve ser tratado no arquivo `error.tsx` nativo do Next.js (App Router), capture a rejeição na própria Promise antes de passá-la, ou utilize abordagens puramente funcionais.

# Restrições
- **Proibido Componentes de Classe:** Escreva código 100% funcional. Não introduza complexidade desnecessária com estruturas antigas do React (`class`, `componentDidCatch`, etc.).
- **Idioma do Chat:** Forneça todas as explicações, respostas e interações no chat do Cursor obrigatoriamente em português brasileiro (pt-BR).
- Não altere caminhos de importação existentes (`@/...`).
- Não modifique a diretiva `"use client"` se ela já existir no topo do arquivo.
- Modifique exclusivamente a lógica de requisição e renderização assíncrona, deixando intocadas as outras interações e estados do componente.
