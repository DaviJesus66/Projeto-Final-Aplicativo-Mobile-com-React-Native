## Atividade Prática: Gerenciador de Despesas 2.0 (adaptado para o Fitdesk)

**Aluno,Matrícula:** [
    "Alyson Fabio Dos Santos viana, 24214290012";
    "Davi Souza De Jesus, 24214290011"; 
    "Henrique Rodrigues Valentim, 24214290056", 
    "Wilson Ney Gomes Evngelista,24214290051"; 
    "Gabriel Araújo Da Silva,24214290041"
    ] 


### O que foi feito
- Estado global com Context API + `useReducer` (ADD, UPDATE, DELETE, SET) e persistência com AsyncStorage (`isLoaded`).
- Tela única para criar/editar via `route.params`, título com `setOptions` e exclusão com `Alert`.
- Formulário com objeto único, `validate()` com 4+ regras, mensagens por campo, Modal de músculo e `KeyboardAvoidingView`.
- Lista com `ListEmptyComponent`, sumário (quantidade e total), busca com `useDebounce` + `useMemo`.
- Tema claro/escuro (`theme.js` + `useColorScheme`) e sombra por plataforma (`Platform.select`).
- Bônus: filtro por grupo combinado com a busca, "Limpar tudo" com confirmação e 2 colunas com `useWindowDimensions`.

### Prints
**Lista – modo claro**
[anexar print]

**Lista – modo escuro**
[anexar print]

**Formulário com mensagens de erro**
[anexar print]
