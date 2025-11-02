// padronizar nomes

const stripAccents = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const stripSuffixes = (s) => s.replace(/\b(jr|sr|ii|iii|iv)\b/gi, "");
const normalize = (s) =>
  stripAccents(s || "")
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const nameKey = (s) => normalize(stripSuffixes(s)).replace(/\s+/g, "");