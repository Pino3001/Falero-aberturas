import React from 'react';
import { PaperProvider, } from 'react-native-paper';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';



// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const appName = "FALERO";
  return (
    <PaperProvider>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors.colors.text,
              // Disable the static render of the header on web
              // to prevent a hydration error in React Navigation v6.
              headerShown: useClientOnlyValue(false, true),
            }}>
            <Tabs.Screen
              name="nuevo_presupuesto"
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
                          color={Colors.colors.text}
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

      </ThemeProvider>
    </PaperProvider>
  );
}
