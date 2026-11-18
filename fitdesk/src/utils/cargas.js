import AsyncStorage from '@react-native-async-storage/async-storage';

// Carga (em kg) usada em cada exercício. Fica salva por usuário e por exercício,
// para a próxima vez que a pessoa abrir o mesmo exercício já vir preenchida.
const STORAGE_KEY = '@cargas';

export const CARGA_PASSO = 2.5;
export const CARGA_MAX = 500;

// Aceita até 3 dígitos inteiros e 2 casas decimais, com ponto ou vírgula.
export const MASCARA_CARGA = /^\d{0,3}([.,]\d{0,2})?$/;

// "42,5" ou "42.5" -> 42.5. Vazio ou inválido -> null.
export function paraNumero(texto) {
  const t = String(texto ?? '').replace(',', '.');
  if (t === '' || t === '.') return null;
  const n = parseFloat(t);
  return Number.isNaN(n) ? null : n;
}

// 42.5 -> "42,5"; 40 -> "40"
export function formatarCarga(kg) {
  if (kg === null || kg === undefined || kg === '') return '';
  return String(kg).replace('.', ',');
}

async function lerMapa() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export async function carregarCarga(uid, exercise) {
  const mapa = await lerMapa();
  const valor = mapa[`${uid}:${exercise}`];
  return typeof valor === 'number' ? valor : null;
}

export async function salvarCarga(uid, exercise, kg) {
  try {
    const mapa = await lerMapa();
    mapa[`${uid}:${exercise}`] = kg;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapa));
  } catch (e) {
    console.warn('Falha ao salvar a carga:', e);
  }
}

// Plano B (outro aparelho, dados limpos): usa a carga do treino mais recente do mesmo exercício.
// `workouts` já vem do mais recente para o mais antigo.
export function ultimaCargaHistorico(workouts, exercise) {
  const achado = workouts.find((w) => w.exercise === exercise && Number(w.weight) > 0);
  return achado ? Number(achado.weight) : null;
}
