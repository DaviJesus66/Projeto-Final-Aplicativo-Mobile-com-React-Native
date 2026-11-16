import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StatusBar, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './theme-context';
import { cardShadow, radius } from '../constants/theme';

// Feedback padronizado do app: mensagens curtas de sucesso, erro e informação (toast).
// Uso: const { showSuccess, showError, showInfo } = useFeedback();
const FeedbackContext = createContext(null);

const DURACAO_MS = 3000;
const TOP = Platform.select({ ios: 56, android: (StatusBar.currentHeight || 24) + 12, default: 16 });

const ICONES = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export function FeedbackProvider({ children }) {
  const { colors } = useTheme();
  const [toast, setToast] = useState(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [anim]);

  const show = useCallback(
    (type, message) => {
      clearTimeout(timer.current);
      setToast({ type, message });
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, DURACAO_MS);
    },
    [anim, hide]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(
    () => ({
      showSuccess: (message) => show('success', message),
      showError: (message) => show('error', message),
      showInfo: (message) => show('info', message),
    }),
    [show]
  );

  const fundo = toast?.type === 'success' ? colors.success : toast?.type === 'error' ? colors.error : colors.card;
  const texto = toast?.type === 'success' ? colors.onPrimary : toast?.type === 'error' ? '#FFFFFF' : colors.text;

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrap,
            { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
          ]}
        >
          <Pressable onPress={hide} style={[styles.toast, cardShadow, { backgroundColor: fundo, borderColor: colors.border }]}>
            <Ionicons name={ICONES[toast.type]} size={22} color={texto} />
            <Text style={[styles.message, { color: texto }]}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback deve ser usado dentro de um FeedbackProvider.');
  }
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: TOP, left: 16, right: 16, zIndex: 999, elevation: 10 },
  toast: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: radius.md, borderWidth: 1 },
  message: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600' },
});
