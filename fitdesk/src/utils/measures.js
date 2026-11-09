// Variação de peso no mês atual (kg). Retorna null se não houver dados suficientes.
// `measures` deve estar ordenado do mais recente para o mais antigo.
export function monthlyVariation(measures, ref = new Date()) {
  const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const inMonth = measures.filter((m) => new Date(m.date) >= monthStart);
  if (inMonth.length === 0) return null;

  const latest = inMonth[0];
  const before = measures.find((m) => new Date(m.date) < monthStart);
  const base = before || inMonth[inMonth.length - 1];
  if (base.id === latest.id) return null;

  return Math.round((latest.weight - base.weight) * 10) / 10;
}

export function calcImc(weight, heightCm) {
  if (!weight || !heightCm) return null;
  const m = heightCm / 100;
  return Math.round((weight / (m * m)) * 10) / 10;
}
