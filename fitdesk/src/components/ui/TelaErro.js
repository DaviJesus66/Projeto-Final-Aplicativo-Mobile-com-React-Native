import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { spacing } from '../../constants/theme';
import Botao from './Botao';

// Tela de erro reutilizável.
// - title / message (opcionais): textos mostrados ao usuário.
// - onRetry (opcional): se existir, mostra o botão "Tentar novamente".
// - retryLabel (opcional): troca o texto do botão.
export default function TelaErro({
  title = 'Algo deu errado',
  message = 'Não foi possível concluir essa ação. Tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="alert-circle-outline" size={72} color={colors.error} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {onRetry ? (
        <View style={styles.action}>
          <Botao title={retryLabel} icon="refresh" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});