// Gera docs/index.html (GitHub Pages) a partir de link/andamento.html,
// colocando o cabeçalho HTML completo que a página do Artifact não precisa ter.
// Uso: node link/gerar-pages.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, "andamento.html"), "utf8");
const cut = src.indexOf("<main");
if (cut < 0) throw new Error("andamento.html sem <main>");
const head = src.slice(0, cut).replace(/<meta name="claude:viewport-fit-sides"[^>]*>\s*/, "");
const body = src.slice(cut);

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📋</text></svg>">
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
const out = path.join(here, "..", "docs");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html, "utf8");
fs.copyFileSync(path.join(here, "progresso.json"), path.join(out, "progresso.json"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("ok: docs/index.html gerado");
