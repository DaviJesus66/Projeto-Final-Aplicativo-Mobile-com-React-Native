# Fitdesk

App de academia em React Native (Expo) para consultar a ficha de treino, escolher o exercício a executar, registrar os treinos da semana e acompanhar peso e altura.

Estrutura baseada na atividade **Gerenciador de Despesas 2.0** (Aula 09): Context API + useReducer, AsyncStorage, formulário validado, busca com debounce e tema claro/escuro.

## Funcionalidades
- **Treinar:** escolha entre membros superiores/inferiores, depois o músculo, e veja a ficha com séries × repetições. Tocar no exercício abre o registro já preenchido.
- **Histórico:** todos os treinos, com busca (debounce), filtro por grupo, quantidade e total de séries. Toque para editar/excluir.
- **Semana:** últimos 7 dias, com os dias treinados e os músculos de cada dia.
- **Corpo:** peso e altura com validação, IMC, histórico e variação do mês.
- **Ajustes:** tema Automático/Claro/Escuro e limpar todos os treinos.

## Como criar e rodar
```bash
npx create-expo-app@latest Fitdesk --template blank
cd Fitdesk
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage \
  @react-native-community/datetimepicker expo-haptics expo-status-bar @expo/vector-icons
```
Copie `App.js` e a pasta `src/` deste projeto para dentro da pasta criada (substituindo o `App.js`) e rode:
```bash
npm install
npx expo start
```
Não envie `node_modules` no PR.

## Estrutura
```
App.js
src/
├── components/
│   ├── treino/  TreinoItem, TreinoLista, TreinoSaida, TreinoSumario, ResumoSemana
│   └── ui/      Botao, Campo, Chip, EstadoVazio, SeletorModal
├── constants/   theme.js, workouts.js
├── hooks/       useDebounce.js
├── navigation/  Navegacao.js
├── screens/     TodosTreinos, TreinosRecentes, GerenciarTreino, EscolherFoco, FichaTreino, PesoAltura, Configuracoes
├── store/       workouts-context.js, measures-context.js, theme-context.js
└── utils/       date.js, measures.js
```

## Equivalência com a atividade de despesas
| Despesas | Fitdesk |
|---|---|
| `expenses-context.js` | `workouts-context.js` (ADD, UPDATE, DELETE, SET + AsyncStorage `@workouts`) |
| `useExpenses()` | `useWorkouts()` |
| `TodasDespesas` / `DespesasRecentes` | `TodosTreinos` / `TreinosRecentes` |
| `GerenciarDespesa` (criar/editar) | `GerenciarTreino` (`workoutId` por parâmetro de rota) |
| `DespesaItem/Lista/Saida/Sumario` | `TreinoItem/Lista/Saida/Sumario` |
| `{ id, description, amount, date, category }` | `{ id, exercise, sets, reps, date, muscle (+ group) }` |
| Modal de categoria | Modal de músculo |

## Próximo passo do projeto final
A persistência hoje é local (AsyncStorage). Para o projeto final, troque as chamadas de `AsyncStorage` dentro dos contextos por leitura/gravação no **Firestore**, mantendo o reducer e as telas como estão.
