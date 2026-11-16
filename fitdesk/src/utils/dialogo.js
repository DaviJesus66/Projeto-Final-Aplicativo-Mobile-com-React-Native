import { Alert, Platform } from 'react-native';

// Alert.alert não faz nada no react-native-web, então na web usamos window.confirm.
// confirmar({ title, message, confirmText, cancelText, destructive, onConfirm })
export function confirmar({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  destructive = false,
  onConfirm,
}) {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && typeof window.confirm === 'function'
      ? window.confirm(`${title}\n\n${message}`)
      : true;
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
