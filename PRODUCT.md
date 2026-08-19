# PRODUCT.md — VetStock

## Product Identity

**Name:** VetStock  
**Tagline:** Gestão de Estoque Inteligente para Pet Shops e Clínicas Veterinárias  
**Description:** Aplicativo mobile-first (React Native + Expo) para controle de estoque, alertas de validade, reposição automática e gestão de produtos veterinários. Funciona offline-first com sincronização em background quando online.

**Primary User:** Gerentes/proprietários de pet shops e clínicas veterinárias (1-50 unidades), funcionários de balcão e farmacêuticos responsáveis por controle de medicamentos.

**Core Job-to-be-Done:** "Quero saber exatamente o que tenho em estoque, o que vai vencer, o que precisa ser reposto — e resolver tudo em poucos toques, mesmo sem internet."

## Platform

adaptive  
**Runtime:** Expo SDK 57, React 19, React Native 0.86  
**Navigation:** React Navigation v7 (Stack + Bottom Tabs)  
**State:** React Context + AsyncStorage (offline-first)  
**API:** REST backend (Node/Express) em `vetstock-backend/`, autenticação JWT

## Durable Constraints & Assets

- **Brand colors:** Verde veterinário (`#1B5E20`, `#2E7D32`, `#4CAF50`) + alertas semânticos (vermelho/amarelo/verde)
- **Logo:** Patinha 🐾 (emoji nativo) — manter identidade "amigável, não clínica"
- **Categoria fixa:** 8 categorias pré-definidas com cores associadas (Medicamentos, Vacinas, Antiparasitários, Soluções, Suplementos, Equipamentos, Outros)
- **Unidades de medida:** 10 unidades fixas (comprimidos, cápsulas, frascos, ampolas, doses, unidades, kg, g, ml, litros)
- **Roles:** `admin` | `funcionario` (RBAC simples)
- **Offline-first:** Todas as operações CRUD funcionam offline, sincronizam quando online
- **Acessibilidade:** WCAG 2.1 AA mínimo (contraste 4.5:1, touch targets 44dp, labels semânticos)

## Key Workflows

1. **Login** → credenciais salvas no AsyncStorage, token JWT
2. **Dashboard (Home)** → visão geral: stats cards, alertas de validade, estoque baixo, valor total, categorias
3. **Produtos** → lista completa com busca, filtro por categoria/status, ordenação, ações rápidas (+1, +5, -1, editar, excluir)
4. **Alertas (LowStock)** → só itens abaixo do mínimo, com barra de progresso, sugestão de reposição, botões +5/+10/Repor mínimo
5. **Adicionar/Editar** → modal bottom-sheet (mobile) / modal centralizado (web) com validação em tempo real, preview live

## Differentiators

- **Validade como cidadão de primeira classe:** alertas visuais proeminentes (vencidos/expirando) no dashboard e lista
- **Ações de quantidade inline:** botões +1/+5/-1/+10 direto no card — sem abrir tela de edição
- **Cores por categoria:** identificação visual instantânea (azul=medicamentos, verde=vacinas, roxo=antiparasitários...)
- **Funciona 100% offline:** critical para áreas rurais/clínicas com conexão instável

## Stack

- **Framework:** Expo (managed workflow)
- **Language:** TypeScript strict
- **UI:** React Native core components + StyleSheet (sem UI kit externo)
- **Icons:** Emoji nativo (zero dependências, renderiza nativo em cada OS)
- **Storage:** @react-native-async-storage/async-storage
- **Networking:** fetch nativo + interceptors customizados
- **Dev:** `expo start`, `expo start --web`, `npm run typecheck`

## Platform Hypothesis

`adaptive` — O design deve respeitar convenções de cada plataforma:
- iOS: navegação por swipe, safe areas, pull-to-refresh nativo, modal bottom-sheet
- Android: Material elevation, back handler, FAB padrão
- Web: hover states, keyboard navigation, responsive breakpoints, modais centrados

## Open Questions (for DESIGN.md)

- [ ] Tipografia: usar system fonts (San Francisco / Roboto) ou fonte customizada?
- [ ] Tema escuro/claro: implementar agora ou depois?
- [ ] Animações: Reanimated 3 para transições fluidas?
- [ ] Design tokens: extrair para package compartilhado (web + native)?
- [ ] Componentes base: criar lib interna (Button, Input, Card, Badge, Modal)?