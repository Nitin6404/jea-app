// import * as React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { PaperProvider } from 'react-native-paper';
// import { LightTheme } from './src/theme/light';
// import { DarkTheme } from './src/theme/dark';
// import AppNavigator from './src/navigation/AppNavigator';
// import { useColorScheme } from 'react-native';

// export default function App() {
//   const colorScheme = useColorScheme();
//   return (
//     <PaperProvider theme={colorScheme === 'dark' ? DarkTheme : LightTheme}>
//       <NavigationContainer>
//         <AppNavigator />
//       </NavigationContainer>
//     </PaperProvider>
//   );
// }

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Splash from './src/screens/splash';
import Register from './src/screens/register';
import HomeScreen from './src/screens/HomeScreen';
// import MainScreen from './src/screens/MainScreen/MainScreen';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import Start from './src/screens/Start/Start';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, RootState, store } from './src/redux/store';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, Portal, useTheme } from 'react-native-paper';
// import CustomSnackbar from './src/components/Snackbar/CustomSnackbar';
// import Profile from './src/screens/Profile/Profile';
// import ProfileViewScreen from './src/screens/Profile/ProfileViewScreen';
// import EditProfile from './src/screens/Profile/EditProfile';
// import messaging from '@react-native-firebase/messaging';
import {
  PermissionsAndroid,
  Platform,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme } from './src/theme/dark';
import { LightTheme } from './src/theme/light';
// import useNotificationSocket from './src/hooks/useNotificationSocket';
// import { CaptureProtection } from 'react-native-capture-protection';
// import { Portal } from 'react-native-paper';
import { Paths } from './src/navigation/path';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: { step?: number };
  Home: undefined;
};

export const queryClient = new QueryClient();

const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading component for PersistGate
const PersistLoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#181818',
    }}
  >
    <ActivityIndicator size="large" color={'#fff'} />
    <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
      Loading...
    </Text>
  </View>
);

const AppStack = () => {
  // useNotificationSocket();

  // useEffect(() => {
  // CaptureProtection.prevent();
  // }, []);

  // async function requestUserPermission() {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //   if (enabled) {
  //     console.info('Authorization status:', authStatus);
  //   }
  // }

  // useEffect(() => {
  //   requestUserPermission();
  // }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* MainScreen contains the bottom navigation and is the main entry after auth */}
      {/* <Stack.Screen name={Paths.MAIN_SCREEN} component={MainScreen} /> */}
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Other screens are stacked above the bottom nav as needed */}
      {/* <Stack.Screen name={Paths.CONTACT_CHAT} component={ContactChat} />
      <Stack.Screen name={Paths.ADD_CONTACT} component={AddContact} />
      <Stack.Screen name={Paths.FRIEND_REQUESTS} component={FriendRequests} />
      <Stack.Screen name={Paths.PROFILE} component={Profile} />
      <Stack.Screen name="ProfileView" component={ProfileViewScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} /> */}
    </Stack.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Paths.SPLASH} component={Splash} />
    {/* <Stack.Screen name={Paths.START} component={Start} /> */}
    <Stack.Screen name={Paths.REGISTER} component={Register} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  console.log('token value', token);

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Notification permission not granted');
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    }
  }
};

const App = () => {
  const colorScheme = useColorScheme();
  console.log(colorScheme);
  const color = useTheme();
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('light-content', true);
      StatusBar.setBackgroundColor('#181818', true);
      StatusBar.setTranslucent(false);
    } else {
      StatusBar.setBarStyle('light-content', true);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PaperProvider>
          <PersistGate loading={<PersistLoadingScreen />} persistor={persistor}>
            <GestureHandlerRootView style={styles.container}>
              <SafeAreaProvider>
                <StatusBar
                  barStyle={
                    colorScheme === 'dark' ? 'light-content' : 'dark-content'
                  }
                  backgroundColor="transparent"
                  // translucent={true}
                  hidden={true}
                />
                <SafeAreaView style={styles.safeAreaContainer}>
                  <PaperProvider theme={color}>
                    <Portal.Host>
                      <RootNavigator />
                      {/* <CustomSnackbar /> */}
                    </Portal.Host>
                  </PaperProvider>
                </SafeAreaView>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </PersistGate>
        </PaperProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
