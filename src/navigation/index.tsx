import React from 'react';
import { Text, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { useStore } from '../store';
import HomeScreen from '../screens/HomeScreen';
import RankingScreen from '../screens/RankingScreen';
import RegisterScreen from '../screens/RegisterScreen';
import GroupScreen from '../screens/GroupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import StatsScreen from '../screens/StatsScreen';
import AdminScreen from '../screens/AdminScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from '../screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS: Record<string, string> = { Início: '🏠', Ranking: '🏆', Registrar: '➕', Grupo: '👥', Perfil: '👤' };

function Tabs() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border, height: 58 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused }) =>
          route.name === 'Registrar' ? (
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', marginTop: -14 }}>
              <Text style={{ fontSize: 22, color: t.primaryText }}>＋</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{ICONS[route.name]}</Text>
          ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Registrar" component={RegisterScreen} />
      <Tab.Screen name="Grupo" component={GroupScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const t = useTheme();
  const userId = useStore((s) => s.currentUserId);
  const base = t.isDark ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: t.bg, card: t.card, text: t.text, border: t.border, primary: t.primary } };
  return (
    <NavigationContainer theme={navTheme}>
      {userId ? (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: t.card }, headerTintColor: t.text, headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: t.bg } }}>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Calendário" component={CalendarScreen} options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="Conquistas" component={AchievementsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Estatísticas" component={StatsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Atividades" component={ActivitiesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Configurações" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
