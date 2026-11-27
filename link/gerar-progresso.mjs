// Gera progresso.json (só o que pode ser compartilhado) a partir do arquivo de dados do app.
// Uso: node gerar-progresso.mjs "C:\...\Documentos\Plano de Ação\plano-de-acao.json"
// Ficam de fora: anotações, inventário de servidores e diário.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const { toProgresso } = createRequire(import.meta.url)("../progresso.js");
const src = process.argv[2];
if (!src) { console.error("Informe o caminho do plano-de-acao.json"); process.exit(1); }
const s = JSON.parse(fs.readFileSync(src, "utf8"));
if (!s.updated) s.updated = fs.statSync(src).mtime.toISOString();

const out = toProgresso(s);
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), "progresso.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 1), "utf8");
const all = out.demandas.flatMap((d) => d.tasks);
console.log(`ok: ${out.demandas.length} demandas, ${all.filter((t) => t.done).length}/${all.length} tarefas feitas → ${dest}`);
