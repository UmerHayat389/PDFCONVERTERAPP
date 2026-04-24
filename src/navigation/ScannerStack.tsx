import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../screens/ScannerScreen';
import CropScreen from '../screens/CropScreen';
import PreviewScreen from '../screens/PreviewScreen';

const Stack = createStackNavigator();

export default function ScannerStack() {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen
        name="ScannerHome"
        component={ScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Crop"
        component={CropScreen}
        options={{
          title: 'Adjust Scan',
          headerStyle: { backgroundColor: '#0D1B2A' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{
          title: 'Preview',
          headerStyle: { backgroundColor: '#0D1B2A' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}