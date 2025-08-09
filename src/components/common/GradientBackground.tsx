import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    /**background: linear-gradient(180deg, #CEFFCF 0%, #F7FBF2 25%, #F7FBF2 50%, #F7FBF2 100%);
     */
    <LinearGradient
      colors={['#CEFFCF', '#F7FBF2', '#F7FBF2', '#F7FBF2']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
