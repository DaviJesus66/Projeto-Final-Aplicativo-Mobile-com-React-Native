import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../store/theme-context';
import { useAuth } from '../store/auth-context';
import { CampoTexto } from '../components/ui/Campo';
import Botao from '../components/ui/Botao';
import Logo from '../components/ui/Logo';
import { radius, spacing } from '../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Cadastro({ navigation }) {
  const { colors } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    if (name.trim().length < 2) next.name = 'Digite seu nome (mínimo 2 letras).';
    if (!EMAIL_REGEX.test(email.trim())) next.email = 'Digite um e-mail válido.';
    if (password.length < 6) next.password = 'A senha precisa ter pelo menos 6 caracteres.';
    if (confirm !== password) next.confirm = 'As senhas não são iguais.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    setFormError('');
    if (!validate()) return;
    setLoading(true);
    const result = await register({ name, email, password });
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
          <Text style={[styles.title, { color: colors.text }]}>Criar conta</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Preencha os dados para começar a treinar.</Text>
        </View>

        {formError ? (
          <View style={[styles.errorBox, { borderColor: colors.error }]} accessibilityRole="alert">
            <Text style={{ color: colors.error, fontWeight: '600' }}>{formError}</Text>
          </View>
        ) : null}

        <CampoTexto
          label="Nome"
          value={name}
          onChangeText={setName}
          error={errors.name}
          placeholder="Como devemos te chamar?"
          autoCapitalize="words"
        />
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
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CampoTexto
          label="Confirmar senha"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          placeholder="Repita a senha"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Botao title="Criar conta" icon="checkmark-circle-outline" onPress={handleRegister} loading={loading} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Já tem uma conta?</Text>
          <Botao
            title="Voltar para o login"
            variant="outline"
            icon="arrow-back-outline"
            onPress={() => navigation.navigate('Login')}
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