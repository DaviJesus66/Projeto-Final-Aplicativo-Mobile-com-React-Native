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
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    // Um id antigo ou inválido não pode impedir o agendamento de um lembrete novo.
    console.warn('Não foi possível cancelar o lembrete anterior:', e);
  }
}

// Diz em qual etapa o erro aconteceu, para a mensagem mostrada ao usuário ajudar a achar a causa.
async function etapa(nome, fn) {
  try {
    return await fn();
  } catch (e) {
    throw new Error(`${nome}: ${(e && e.message) || e}`);
  }
}

// Pede permissão, agenda a notificação diária e guarda o id para poder cancelar depois.
// Devolve { ok: false, motivo } quando não dá para ativar sem ser um erro:
// motivo 'web' (sem notificações no navegador) ou 'permissao' (o usuário negou).
export async function ativarLembrete(hour, minute) {
  if (Platform.OS === 'web') return { ok: false, motivo: 'web' };

  // No Android 8+ toda notificação precisa de um canal, e no Android 13+ ele precisa existir
  // antes de pedir a permissão. Se a criação falhar, seguimos: o sistema usa o canal padrão.
  let canalCriado = false;
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CANAL, {
        name: 'Lembrete de treino',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      canalCriado = true;
    } catch (e) {
      console.warn('Canal de notificação não criado:', e);
    }
  }

  const { status } = await etapa('permissão', async () => {
    let atualPermissao = await Notifications.getPermissionsAsync();
    if (atualPermissao.status !== 'granted') {
      atualPermissao = await Notifications.requestPermissionsAsync();
    }
    return atualPermissao;
  });
  if (status !== 'granted') return { ok: false, motivo: 'permissao' };

  const atual = await carregarLembrete();
  await cancelarAgendado(atual.id);

  const conteudo = {
    title: 'Hora de treinar! 💪',
    body: 'Abra o Fitdesk e escolha o treino de hoje.',
  };
  const gatilho = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  // Primeiro tenta com o canal; se o aparelho recusar, tenta de novo sem ele.
  const id = await etapa('agendamento', async () => {
    if (canalCriado) {
      try {
        return await Notifications.scheduleNotificationAsync({
          content: conteudo,
          trigger: { ...gatilho, channelId: CANAL },
        });
      } catch (e) {
        console.warn('Agendamento com canal falhou, tentando sem canal:', e);
      }
    }
    return Notifications.scheduleNotificationAsync({ content: conteudo, trigger: gatilho });
  });

  const config = await etapa('salvar', () => salvarLembrete({ enabled: true, hour, minute, id }));
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
