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
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarItemStyle: {
          borderRadius: 16, // Bordes redondeados en los botones
          marginHorizontal: 6,
          marginVertical: 6,
          height: 48,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
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
        name="nuevo/index"
        options={{
          title: 'Nuevo Presupuesto',
          tabBarLabel: 'Nuevo',
          tabBarIcon: ({ color }) => <Entypo name="calculator" size={28} color={color} />,
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
        name="listado/index"
        options={{
          title: 'Presupuestos',
          tabBarIcon: ({ color }) => <FontAwesome name="list-ol" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="materiales/index"
        options={{
          title: 'Materiales',
          tabBarIcon: ({ color }) => <FontAwesome name="usd" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
