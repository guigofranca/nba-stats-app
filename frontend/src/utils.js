// === Funções auxiliares para normalizar nomes ===
const stripAccents = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const stripSuffixes = (s) => s.replace(/\b(jr|sr|ii|iii|iv)\b/gi, "");
const normalize = (s) =>
  stripAccents(s || "")
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Cria uma chave de nome única e limpa (remove acentos, sufixos, espaços)
 * Ex: "LeBron James Jr." -> "lebronjames"
 */
export const nameKey = (s) => normalize(stripSuffixes(s)).replace(/\s+/g, "");