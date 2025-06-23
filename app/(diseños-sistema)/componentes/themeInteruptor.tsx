// En components/ThemeToggle.tsx
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../utils/contexts/ThemeContext';
import {  Text, Switch } from 'react-native-paper';
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 16, marginRight: 30 }}>{`Modo ${theme}`}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center'}} >
        <Feather name="sun" size={24} color={colors.onBackground} style={{marginRight: 7}} />
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={colors.primary}
          trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
        />
        <MaterialCommunityIcons name="moon-full" size={24} color={colors.onBackground} style={{marginLeft: 7}}/>
      </View>

    </View>
  );
};

export default ThemeToggle;