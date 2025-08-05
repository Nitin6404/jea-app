import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text variant="headlineMedium">Hello Nitin!</Text>
      <Button mode="contained" onPress={() => console.log('Pressed')}>
        Press me
      </Button>
    </View>
  );
}
