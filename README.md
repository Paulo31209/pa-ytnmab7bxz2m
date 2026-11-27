# Plano de Ação

App de Windows estilo Notion para acompanhar o plano de ação de infraestrutura, live, apps e IA: demandas com checklist, guias "como fazer", quadro kanban, inventário de servidores e diário de ligações.

## Instalar

Baixe o instalador na página **Releases** deste repositório (`Plano-de-Acao-Setup-x.y.z.exe`) e execute.
O Windows pode mostrar "O Windows protegeu o computador" (o app não tem assinatura digital paga): clique em **Mais informações → Executar assim mesmo**.

## Onde ficam os dados

- `Documentos\Plano de Ação\plano-de-acao.json` — salvo automaticamente a cada alteração.
- `Documentos\Plano de Ação\backups\` — uma cópia por dia, guarda as últimas 30.
- No app: **📁 Abrir pasta dos dados**, **⤓ Backup** e **⤒ Importar**.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html`, `app.js`, `app.css` | A interface (funciona também aberta direto no navegador, salvando no navegador) |
| `data.js` | Conteúdo inicial do plano e os guias "como fazer" |
| `ds/` | Design system (tokens, temas, componentes) |
| `main.js`, `preload.js` | App de computador (Electron): janela, menu e gravação do arquivo de dados |
| `build/icon.png` | Ícone do app |
| `link/` | Página de acompanhamento só leitura (`andamento.html`) e o script que gera `progresso.json` a partir dos dados do app |

## Desenvolver

```powershell
npm install
npx electron .          # abre o app sem instalar
npm run dist            # gera o instalador em dist\
```

Se o `makensis` reclamar de "could not open file", o caminho da pasta está longo demais: copie o projeto para uma pasta de caminho curto (ex.: `C:\dev\plano-de-acao`) e rode o `npm run dist` de lá.

Com o npm 11, o download do Electron pode ficar bloqueado até você aprovar: `npm install-scripts approve electron`.
