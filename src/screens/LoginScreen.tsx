import React from 'react';
import { Text, View } from 'react-native';
import GradientBackground from '../components/common/GradientBackground';
import useThemeColors from '../hooks/useThemeColors';

const LoginScreen = () => {
  const { colors } = useThemeColors();
  return (
    <GradientBackground>
      <View>
        <Text style={{ color: colors.primary }}>Login</Text>
      </View>
    </GradientBackground>
  );
};

export default LoginScreen;
