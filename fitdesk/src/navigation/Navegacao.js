import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../store/theme-context';
import { useAuth } from '../store/auth-context';
import { useWorkouts } from '../store/workouts-context';
import { useMeasures } from '../store/measures-context';
import EscolherFoco from '../screens/EscolherFoco';
import FichaTreino from '../screens/FichaTreino';
import ExecutarExercicio from '../screens/ExecutarExercicio';
import Treinos from '../screens/Treinos';
import GerenciarTreino from '../screens/GerenciarTreino';
import PesoAltura from '../screens/PesoAltura';
import Configuracoes from '../screens/Configuracoes';
import Login from '../screens/Login';
import Cadastro from '../screens/Cadastro';
import TelaLoading from '../components/ui/TelaLoading';
import ErroBoundary from '../components/ui/ErroBoundary';
import Logo from '../components/ui/Logo';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// [Ícone ativo, Ícone inativo]
const TAB_ICONS = {
  Treinar: ['barbell', 'barbell-outline'],
  Treinos: ['list', 'list-outline'],
  Corpo: ['body', 'body-outline'],
  Config: ['settings', 'settings-outline'],
};

function AddButton({ navigation, color }) {
  return (
    <Ionicons
      name="add"
      size={30}
      color={color}
      style={{ marginRight: 16 }}
      onPress={() => navigation.navigate('GerenciarTreino')}
    />
  );
}

function Abas() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Treinar"
        component={EscolherFoco}
        options={{ title: 'Treinar', headerTitle: () => <Logo height={30} /> }}
      />
      <Tab.Screen
        name="Treinos"
        component={Treinos}
        options={({ navigation }) => ({
          title: 'Treinos',
          headerRight: () => <AddButton navigation={navigation} color={colors.primary} />,
        })}
      />
      <Tab.Screen name="Corpo" component={PesoAltura} options={{ title: 'Peso e altura' }} />
      <Tab.Screen name="Config" component={Configuracoes} options={{ title: 'Configurações', tabBarLabel: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

export default function Navegacao() {
  const { colors, isDark, isLoaded: themeLoaded } = useTheme();
  const { isLoggedIn, isLoaded: authLoaded } = useAuth();
  const { isLoaded: workoutsLoaded } = useWorkouts();
  const { isLoaded: measuresLoaded } = useMeasures();

  if (!themeLoaded || !authLoaded || !workoutsLoaded || !measuresLoaded) {
    return <TelaLoading message="Carregando..." />;
  }

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ErroBoundary>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Abas" component={Abas} options={{ headerShown: false }} />
              <Stack.Screen name="FichaTreino" component={FichaTreino} options={{ title: 'Ficha de treino' }} />
              <Stack.Screen name="ExecutarExercicio" component={ExecutarExercicio} options={{ title: 'Exercício' }} />
              <Stack.Screen name="GerenciarTreino" component={GerenciarTreino} options={{ title: 'Novo treino' }} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Cadastro" component={Cadastro} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ErroBoundary>
  );
}