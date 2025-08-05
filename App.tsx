import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { LightTheme } from './src/theme/light';
import { DarkTheme } from './src/theme/dark';
import AppNavigator from './src/navigation/AppNavigator';
import { useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();
  return (
    <PaperProvider theme={colorScheme === 'dark' ? DarkTheme : LightTheme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
