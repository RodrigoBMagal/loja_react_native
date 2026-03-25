import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { StockProvider, useStock } from './src/context/StockContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import LowStockScreen from './src/screens/LowStockScreen';
import AddEditProductScreen from './src/screens/AddEditProductScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused, badge }) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ position: 'relative' }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      {badge > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#C62828', borderRadius: 10,
          minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  </View>
);

const MainTabs = ({ route }) => {
  const user = route?.params?.user;
  const { getLowStockProducts } = useStock();
  const lowStockCount = getLowStockProducts().length;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#9E9E9E',
        headerStyle: { backgroundColor: '#1B5E20' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ user }}
        options={{
          title: 'Início',
          headerTitle: '🐾 VetStock',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'Produtos',
          headerTitle: '📦 Estoque',
          tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LowStock"
        component={LowStockScreen}
        options={{
          title: 'Alertas',
          headerTitle: '⚠️ Estoque Baixo',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚠️" focused={focused} badge={lowStockCount} />
          ),
          tabBarBadgeStyle: { backgroundColor: '#C62828' },
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen
      name="AddEditProduct"
      component={AddEditProductScreen}
      options={({ route }) => ({
        headerShown: true,
        headerTitle: route.params?.mode === 'edit' ? '✏️ Editar Produto' : '➕ Novo Produto',
        headerStyle: { backgroundColor: '#1B5E20' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        presentation: 'modal',
      })}
    />
  </Stack.Navigator>
);

export default function App() {
  return (
    <StockProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </StockProvider>
  );
}