import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lembrete diário de treino (notificação local agendada).
// Notificações locais funcionam no Expo Go; as remotas (push) não são usadas aqui.
const STORAGE_KEY = '@lembrete';
const CANAL = 'lembrete-treino';

// Mostra a notificação mesmo com o app aberto.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  // Indisponível em alguns ambientes (ex.: web).
}

export const LEMBRETE_PADRAO = { enabled: false, hour: 18, minute: 0, id: null };

export function formatarHorario(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export async function carregarLembrete() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? { ...LEMBRETE_PADRAO, ...JSON.parse(raw) } : LEMBRETE_PADRAO;
  } catch (e) {
    return LEMBRETE_PADRAO;
  }
}

async function salvarLembrete(config) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  return config;
}

async function cancelarAgendado(id) {
  if (id) await Notifications.cancelScheduledNotificationAsync(id);
}

// Pede permissão, agenda a notificação diária e guarda o id para poder cancelar depois.
// Devolve { ok: false } se o usuário negar a permissão.
export async function ativarLembrete(hour, minute) {
  // No Android 13+ o canal precisa existir antes de pedir a permissão.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembrete de treino',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return { ok: false };

  const atual = await carregarLembrete();
  await cancelarAgendado(atual.id);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de treinar! 💪',
      body: 'Abra o Fitdesk e escolha o treino de hoje.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CANAL,
    },
  });

  const config = await salvarLembrete({ enabled: true, hour, minute, id });
  return { ok: true, config };
}

export async function desativarLembrete() {
  const atual = await carregarLembrete();
  await cancelarAgendado(atual.id);
  return salvarLembrete({ ...atual, enabled: false, id: null });
}

// Troca o horário; se o lembrete estiver ligado, reagenda.
export async function alterarHorario(hour, minute) {
  const atual = await carregarLembrete();
  if (!atual.enabled) return salvarLembrete({ ...atual, hour, minute });
  const resultado = await ativarLembrete(hour, minute);
  return resultado.ok ? resultado.config : atual;
}
