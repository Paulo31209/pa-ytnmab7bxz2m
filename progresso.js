/* Converte os dados do app no "progresso" que pode ser publicado.
   Ficam de fora: anotações, inventário de servidores e diário. */
function toProgresso(s) {
  const num = (d) => { const n = parseFloat(d.num); return isNaN(n) ? 999 : n; };
  return {
    atualizado: s.updated || new Date().toISOString(),
    demandas: [...(s.demandas || [])].sort((a, b) => num(a) - num(b)).map((d) => ({
      num: d.num, icon: d.icon, title: d.title, summary: d.summary,
      status: d.status, priority: d.priority, area: d.area || "",
      owner: d.owner || "", due: d.due || "",
      tasks: (d.tasks || []).map((t) => ({ text: t.text, done: !!t.done })),
    })),
  };
}
module.exports = { toProgresso };
