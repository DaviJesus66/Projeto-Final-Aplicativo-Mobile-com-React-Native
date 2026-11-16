# Fitdesk

App de academia em React Native (Expo): ficha de treino por músculo, execução do exercício série a série, histórico com busca e filtro, resumo da semana, peso/altura com IMC, tema claro/escuro e lembrete diário de treino.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Confira o arquivo `.env` (modelo em `.env.example`) com as chaves do seu projeto Firebase.
3. Configure o Firebase (uma vez só), em https://console.firebase.google.com:
   - **Authentication → Sign-in method:** ative **E-mail/senha**.
   - **Firestore Database:** crie o banco (se ainda não existir).
   - **Firestore → Regras:** cole o conteúdo de `firestore.rules` e publique.
4. Inicie:
   ```bash
   npx expo start -c
   ```
   Abra no Expo Go (celular) ou use `a` (Android), `i` (iOS) ou `w` (web).

Se o Expo reclamar de versões de pacotes, rode `npx expo install --fix`.

## Arquitetura

- **Login real:** Firebase Authentication (e-mail e senha); a sessão fica salva no aparelho.
- **Dados por conta:** Firestore em `users/{uid}/workouts` e `users/{uid}/measures`, em tempo real e com suporte offline. Cada pessoa só enxerga os próprios dados (regras em `firestore.rules`).
- **Estado:** Context API + `useReducer` (`auth`, `workouts`, `measures`, `theme`, `feedback`).
- **Navegação:** React Navigation. Sem login aparecem Login/Cadastro; com login, abas Treinar, Histórico, Semana, Corpo e Ajustes.
- **Lembrete diário:** notificação local agendada (`expo-notifications`), em Ajustes. Não funciona na web.

## Estrutura

```
App.js
src/
├── components/  treino/ (TreinoItem, Lista, Saida, Sumario, ResumoSemana)  ui/ (Botao, Campo, Chip, ...)
├── constants/   theme.js, workouts.js
├── hooks/       useDebounce.js
├── navigation/  Navegacao.js
├── screens/     Login, Cadastro, EscolherFoco, FichaTreino, ExecutarExercicio,
│                GerenciarTreino, TodosTreinos, TreinosRecentes, PesoAltura, Configuracoes
├── services/    firebase.js, repositorio.js, lembrete.js
├── store/       auth-, workouts-, measures-, theme-, feedback-context.js
└── utils/       date.js, measures.js, dialogo.js
```

Não envie `node_modules` nem o `.env` para o repositório.
