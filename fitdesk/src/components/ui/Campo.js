import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/theme-context';
import { radius } from '../../constants/theme';

function CampoBase({ label, error, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

// Campo de texto com borda vermelha e mensagem quando há erro.
export function CampoTexto({ label, error, style, ...inputProps }) {
  const { colors } = useTheme();
  return (
    <CampoBase label={label} error={error}>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...inputProps}
        style={[
          styles.input,
          { backgroundColor: colors.inputBg, color: colors.text, borderColor: error ? colors.error : colors.border },
          style,
        ]}
      />
    </CampoBase>
  );
}

// Campo que abre um seletor (Modal ou data) ao toque, sem digitação livre.
export function CampoSeletor({ label, error, value, placeholder, icon = 'chevron-down', onPress }) {
  const { colors } = useTheme();
  return (
    <CampoBase label={label} error={error}>
      <Pressable
        onPress={onPress}
        style={[
          styles.input,
          styles.selector,
          { backgroundColor: colors.inputBg, borderColor: error ? colors.error : colors.border },
        ]}
      >
        <Text style={{ color: value ? colors.text : colors.textMuted, fontSize: 16 }}>{value || placeholder}</Text>
        <Ionicons name={icon} size={20} color={colors.textMuted} />
      </Pressable>
    </CampoBase>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1.5, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  error: { fontSize: 13, marginTop: 4 },
});
