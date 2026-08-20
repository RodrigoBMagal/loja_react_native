import React, { useState } from 'react';
import {
  View, Text, Platform,
  ActivityIndicator, Alert, KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackScreenProps } from '@react-navigation/stack';
import { authApi } from '../services/api';
import { useStock } from '../context/StockContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { Button, Input, Card } from '@/components/ui';
import { colors, spacing, typography, borderRadius, getElevation } from '@/design/tokens';

// Usuários são autenticados contra o backend
// Credenciais padrão: admin/123456 ou funcionario/123456
type Props = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { reload } = useStock();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    try {
      // Chama o backend real
      const result = await authApi.login(username.trim(), password.trim());
      if (!result) throw new Error('Resposta vazia do servidor');
      const { token, user } = result;

      // Salva o token para uso nas próximas requisições
      await AsyncStorage.setItem('@vetstock_token', token);
      await AsyncStorage.setItem('@vetstock_user', JSON.stringify(user));

      // Carrega os produtos agora que temos token
      await reload();

      navigation.replace('Main', { user });
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      Alert.alert('Acesso negado', message || 'Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Text style={styles.icon}>🐾</Text>
        </View>
        <Text style={styles.appName}>VetStock</Text>
        <Text style={styles.subtitle}>Gestão de Estoque Veterinário</Text>
      </View>

      <Card variant="default" style={styles.card}>
        <Text style={styles.cardTitle}>Entrar</Text>

        <Input
          label="Usuário"
          placeholder="Digite seu usuário"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          returnKeyType="next"
          leftIcon="👤"
          size="default"
          style={styles.input}
        />

        <Input
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          leftIcon="🔒"
          rightIcon={showPass ? '🙈' : '👁️'}
          onRightIconPress={() => setShowPass(!showPass)}
          size="default"
          style={styles.input}
        />

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          Acessar Sistema
        </Button>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.brand[500],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: spacing[6],
  },
  header: { alignItems: 'center' as const, marginBottom: spacing[8] },
  iconWrapper: {
    width: 80, height: 80, borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: spacing[3],
  },
  icon: { fontSize: 40 },
  appName: { 
    fontSize: typography.sizes.displayLg, 
    fontWeight: typography.weights.bold, 
    color: colors.neutral[0], 
    letterSpacing: 2 
  },
  subtitle: { 
    fontSize: typography.sizes.bodyMd, 
    color: 'rgba(255,255,255,0.7)', 
    marginTop: spacing[1] 
  },
  card: {
    width: '100%' as any,
  },
  cardTitle: { 
    fontSize: typography.sizes.headingLg, 
    fontWeight: typography.weights.bold, 
    color: colors.brand[900], 
    marginBottom: spacing[5] 
  },
  input: {
    marginBottom: spacing[3],
  },
  button: {
    marginTop: spacing[2],
  },
};

export default LoginScreen;