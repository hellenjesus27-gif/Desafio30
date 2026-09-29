# 🏆 DESAFIO 30

App de competição entre amigos: 30 dias de treino e hábitos saudáveis, com pontuação, ranking, grupos, calendário, conquistas e estatísticas.
Feito com **Expo (React Native) + TypeScript** → roda em **iOS, Android e navegador** com o mesmo código.

> ⚠️ **Estado atual:** o app funciona 100% **local** (dados salvos no aparelho, modo demonstração). Para múltiplos usuários reais compartilhando ranking, é preciso ligar o backend (Supabase) — veja a seção 5.

> 🌐 **Prévia web (sem instalar nada):** https://hellenjesus27-gif.github.io/Desafio30/ — versão de demonstração que abre no navegador do celular. O código dela está em `docs/index.html`.

## 1. Regras do desafio (padrão, editáveis pelo admin)
| Hábito | Meta | Pontos |
|---|---|---|
| 🏋️ Treino | mínimo 4/semana | 10 por treino; **+5** no 5º treino da semana (uma vez) |
| 🏃 Cardio | 3/semana, ≥ 30 min cada | 5 por sessão ≥ 30 min |
| 💧 Água | 3 L/dia | 5 por dia |
| 🍫 Zero doce | todo dia | 5 por dia |
| 🍺 Zero álcool | todo dia | 5 por dia |

O ranking mostra sempre se o mínimo semanal foi cumprido (🔴/🟢/⭐), independentemente dos pontos.

## 2. Instalar
Requisitos: Node 20+ e npm.
```bash
npm install
cp .env.example .env   # preencha quando for usar o Supabase
```

## 3. Executar
```bash
npx expo start          # abre o menu; escaneie o QR com o app Expo Go
npx expo start --web    # navegador (desenvolvimento/testes)
npx expo start --android
npx expo start --ios    # somente em macOS
```
Na tela de login, **“👀 Ver demonstração”** carrega um grupo de exemplo (Dia 12 de 30) com participantes fictícios.

## 4. Testar
```bash
npm test          # testes da pontuação, sequências e ranking
npm run typecheck # checagem de tipos
```
Verifique manualmente: navegação, modo escuro (Configurações), telas pequenas (iPhone SE) e grandes, Android com gestos/botões.

## 5. Banco de dados (Supabase)
1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, execute `src/database/schema.sql`.
3. Em *Project Settings → API*, copie **URL** e **anon key** para o `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. O cliente já está em `src/services/supabase.ts`. **Falta migrar** as ações do `src/store/index.ts` (hoje locais) para chamadas ao Supabase (auth, inserts e leituras) — o schema e as políticas RLS já estão prontos. Pendências marcadas em comentários no fim do `schema.sql` (políticas de admin e RPC `join_group`).

**Nunca** coloque a `service_role key` no app nem faça commit do `.env`.

## 6. Variáveis de ambiente
Veja `.env.example`. Variáveis `EXPO_PUBLIC_*` ficam visíveis no app: use somente a *anon key*.

## 7. Login com Apple / Google (a configurar)
A estrutura está em `src/services/socialAuth.ts`. Você precisa:
- **Google:** criar credenciais OAuth no Google Cloud e ativar o provedor no Supabase (*Authentication → Providers*).
- **Apple:** Apple Developer Program (US$ 99/ano), criar *Service ID* e chave, e ativar no Supabase.
Enquanto isso, os botões avisam que a configuração está pendente.

## 8. Notificações
Lembretes **locais** diários (água, treino, cardio, doce, álcool, fechamento) via `expo-notifications` — ative/desative em *Perfil → Configurações*. Para **push remoto** é preciso configurar FCM (Android) e APNs (iOS) pelo EAS.

## 9. Gerar Android
```bash
npm i -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview      # APK para testar
eas build -p android --profile production   # AAB para a Google Play
```
Ajuste `android.package` no `app.json` (hoje `com.seudominio.desafio30`).

## 10. Gerar iOS
Requer conta Apple Developer.
```bash
eas build -p ios --profile production
```
Ajuste `ios.bundleIdentifier` no `app.json`.

## 11. Publicar
- **App Store:** `eas submit -p ios` → App Store Connect: ícones, capturas de tela (6,7" e 5,5"), descrição, política de privacidade e, como há login, exclusão de conta dentro do app.
- **Google Play:** `eas submit -p android` → Play Console: conta de desenvolvedor (taxa única US$ 25), ficha da loja, classificação, política de privacidade.

## 12. Logo e identidade visual
A logo original está em `assets/logo.png` (usada em login, início e grupo) e derivada em `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png` e `favicon.png`. As cores (preto, prata, rosa) estão em `src/theme/index.tsx`.
> A imagem enviada traz o nome “Camila Marques – Personal Trainer”. Se a logo do Desafio 30 for outra, basta substituir os arquivos de `assets/` mantendo os nomes.

## 13. Estrutura
```
App.tsx                 raiz (tema + navegação)
index.js                entrada Expo
app.json                configuração Expo
assets/                 logo e ícones
src/
  components/           ui.tsx (Card, Button, Avatar…), LineChart.tsx
  screens/              Auth, Home, Register, Ranking, Group, Profile,
                        Calendar, Achievements, Stats, Activities, Settings, Admin
  navigation/           abas inferiores + pilha
  store/                estado global (zustand + AsyncStorage)
  services/             supabase, notifications, socialAuth, share, images
  database/schema.sql   modelo do banco (Supabase/PostgreSQL + RLS)
  hooks/                useChallenge (dados derivados)
  utils/                scoring (pontuação/ranking), dates, achievements, labels
  theme/                cores claro/escuro
  types/                tipos TypeScript
  data/seed.ts          dados de demonstração
__tests__/              testes de pontuação
```

## 14. Como colocar no seu GitHub
1. Copie **todo o conteúdo** da pasta `desafio30/` (incluindo arquivos ocultos `.gitignore` e `.env.example`, mas **sem** `node_modules` nem `.env`) para o seu repositório local.
2. `git add . && git commit -m "Desafio 30" && git push`.
