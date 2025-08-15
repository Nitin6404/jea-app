import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LightTheme } from '../../theme/light';
import { DarkTheme } from '../../theme/dark';
import { useNavigation } from '@react-navigation/native';
import { Paths } from '../../navigation/path';

const { width, height } = Dimensions.get('window');

const Splash = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { colors } = useTheme(colorScheme === 'dark' ? DarkTheme : LightTheme);

  const logoAnim = useRef(new Animated.Value(0)).current; // opacity + scale
  const revealAnim = useRef(new Animated.Value(0)).current; // circular scale

  useEffect(() => {
    // Step 1: Delay before showing logo
    setTimeout(() => {
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Step 2: Delay before circular reveal
    setTimeout(() => {
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Step 3: Navigate after animation
        navigation.navigate(Paths.REGISTER);
      });
    }, 1000);
  }, []);

  // Circular reveal scaling
  const circleSize = Math.sqrt(width * width + height * height) * 2;
  const circleStyle = {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#16A244',
    position: 'absolute',
    top: height / 2 - circleSize / 2,
    left: width / 2 - circleSize / 2,
    transform: [{ scale: revealAnim }],
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Circular reveal layer */}
      <Animated.View style={circleStyle} />

      {/* Logo */}
      <Animated.View
        style={{
          opacity: logoAnim,
          transform: [
            {
              scale: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('./../../assets/images/brand-logo.png')}
          style={styles.logo}
        />
      </Animated.View>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});
