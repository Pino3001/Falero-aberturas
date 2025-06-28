import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useTheme } from '@/utils/contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: true,
        tabBarButton: (props) => {
          const { ref, ...rest } = props;
          return (
            <Pressable
              {...rest}
              android_ripple={{
                color: colors.primary,
                borderless: true,
                radius: 34,
                foreground: true,
              }}
            />
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nuevo Presupuesto',
          tabBarLabel: 'Nuevo',
          tabBarIcon: ({ color }) => <Entypo name="calculator" size={24} color={color} />,
          headerRight: () => (
            <Link href='/componentes/modales/opciones' asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="ellipsis-v"
                    size={25}
                    color={colors.inverseSurface}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="listado"
        options={{
          title: 'Presupuestos',
          tabBarIcon: ({ color }) => <FontAwesome name="list-ol" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="materiales"
        options={{
          title: 'Materiales',
          tabBarIcon: ({ color }) => <FontAwesome name="usd" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
