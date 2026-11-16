import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../store/theme-context';
import { useAuth } from '../store/auth-context';
import { CampoTexto } from '../components/ui/Campo';
import Botao from '../components/ui/Botao';
import Logo from '../components/ui/Logo';
import { radius, spacing } from '../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ navigation }) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    if (!EMAIL_REGEX.test(email.trim())) next.email = 'Digite um e-mail válido.';
    if (!password) next.password = 'Digite sua senha.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    setFormError('');
    if (!validate()) return;
    setLoading(true);
    const result = await login({ email, password });
    if (!result.ok) {
      setLoading(false);
      setFormError(result.error);
    }
    // Se deu certo, a navegação troca sozinha para dentro do app (parte 3).
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo height={44} />
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo ao Fitdesk</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Entre na sua conta para ver seus treinos.</Text>
        </View>

        {formError ? (
          <View style={[styles.errorBox, { borderColor: colors.error }]} accessibilityRole="alert">
            <Text style={{ color: colors.error, fontWeight: '600' }}>{formError}</Text>
          </View>
        ) : null}

        <CampoTexto
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CampoTexto
          label="Senha"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="Sua senha"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Botao title="Entrar" icon="log-in-outline" onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Ainda não tem conta?</Text>
          <Botao
            title="Criar conta"
            variant="outline"
            icon="person-add-outline"
            onPress={() => navigation.navigate('Cadastro')}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800', marginTop: spacing.lg, textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: spacing.xs, textAlign: 'center' },
  errorBox: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  footer: { marginTop: spacing.xl },
  footerText: { textAlign: 'center', marginBottom: spacing.sm },
});