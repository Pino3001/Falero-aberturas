import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useTheme } from '@/utils/contexts/ThemeContext';



// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,

          },
          tabBarStyle: {
            backgroundColor: colors.surface,
          },
          tabBarActiveTintColor: colors.primary, // Secondary (terracota) para dar vida
          tabBarInactiveTintColor: '#9E9E8F', // Gris-beige apagado
          headerShown: useClientOnlyValue(false, true),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Nuevo Presupuesto',
            tabBarIcon: ({ color }) => <Entypo name="calculator" size={24} color={color} />,
            headerRight: () => (
              <Link href="/modalOpciones" asChild>
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
          name="presupuestos"
          options={{
            title: 'Lista Presupuestos',
            tabBarIcon: ({ color }) => <FontAwesome name="list-ol" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="precio"
          options={{
            title: 'Editar Materiales',
            tabBarIcon: ({ color }) => <FontAwesome name="usd" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
