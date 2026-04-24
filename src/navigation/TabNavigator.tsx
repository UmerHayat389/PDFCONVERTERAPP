import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ToolsScreen from '../screens/ToolsScreen';
import ScannerStack from './ScannerStack';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Tab icon config
const TAB_ICONS: Record<string, { default: string; active: string }> = {
  Home:     { default: 'home-outline',    active: 'home' },
  Tools:    { default: 'tools',           active: 'tools' },
  Scanner:  { default: 'scan-helper',     active: 'scan-helper' },
  Settings: { default: 'cog-outline',     active: 'cog' },
};

function ScannerTabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
  return (
    <View style={[styles.scannerIconWrap, focused && styles.scannerIconWrapActive]}>
      <Icon name="scan-helper" size={22} color={focused ? '#fff' : '#64748b'} />
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: {
          backgroundColor: '#080F1A',
          borderTopWidth: 1,
          borderTopColor: '#0F1E32',
          height: Platform.OS === 'ios' ? 85 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Scanner') {
            return <ScannerTabIcon color={color} size={size} focused={focused} />;
          }
          const iconSet = TAB_ICONS[route.name] ?? { default: 'home-outline', active: 'home' };
          const iconName = focused ? iconSet.active : iconSet.default;
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={iconName} size={21} color={color} />
            </View>
          );
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      })}>
      <Tab.Screen name="Home"     component={HomeScreen}    options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Tools"    component={ToolsScreen}   options={{ tabBarLabel: 'Tools' }} />
      <Tab.Screen name="Scanner"  component={ScannerStack}  options={{ tabBarLabel: 'Scan' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 38, height: 28, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(230,57,70,0.12)',
  },
  scannerIconWrap: {
    width: 48, height: 34, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0F1E32',
    borderWidth: 1, borderColor: '#1E2D40',
    marginTop: -4,
  },
  scannerIconWrapActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
    shadowColor: '#E63946',
    shadowRadius: 10,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
});