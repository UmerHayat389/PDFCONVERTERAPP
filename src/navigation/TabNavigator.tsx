import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ToolsScreen from '../screens/ToolsScreen';
import ScannerScreen from '../screens/ScannerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#0D1B2A',
          borderTopColor: '#1e293b',
          height: 65,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const icons: Record<string, string> = {
            Home:     'home',
            Tools:    'tools',
            Scanner:  'scan-helper',
            Settings: 'cog',
          };
          return (
            <Icon
              name={icons[route.name] ?? 'home'}
              size={size}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Tools"    component={ToolsScreen} />
      <Tab.Screen name="Scanner"  component={ScannerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}