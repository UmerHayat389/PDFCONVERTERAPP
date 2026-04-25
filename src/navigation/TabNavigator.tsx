import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ToolsScreen from '../screens/ToolsScreen';
import ScannerStack from './ScannerStack';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const ACCENT = '#3F61FE';

const TAB_ICONS: Record<string, { default: string; active: string }> = {
  Home:     { default: 'home-outline',  active: 'home' },
  Tools:    { default: 'tools',         active: 'tools' },
  Scanner:  { default: 'scan-helper',   active: 'scan-helper' },
  Settings: { default: 'cog-outline',   active: 'cog' },
};

function ScannerTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.scannerIconWrap, focused && styles.scannerIconWrapActive]}>
      <Icon name="scan-helper" size={22} color={focused ? '#fff' : '#94A3B8'} />
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,

        // ── Smooth fade transition between tabs ──
        animation: 'fade',
        animationDuration: 180,

        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 1,

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEF0F6',
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#3F61FE',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          if (route.name === 'Scanner') {
            return <ScannerTabIcon focused={focused} />;
          }
          const iconSet = TAB_ICONS[route.name] ?? { default: 'home-outline', active: 'home' };
          const iconName = focused ? iconSet.active : iconSet.default;
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon name={iconName} size={20} color={color} />
            </View>
          );
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      })}>
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Tools"    component={ToolsScreen}    options={{ tabBarLabel: 'Tools' }} />
      <Tab.Screen name="Scanner"  component={ScannerStack}   options={{ tabBarLabel: 'Scan' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40, height: 28, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(63,97,254,0.10)',
  },
  scannerIconWrap: {
    width: 52, height: 36, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EEF1FF',
    marginTop: -6,
  },
  scannerIconWrapActive: {
    backgroundColor: '#3F61FE',
    shadowColor: '#3F61FE',
    shadowRadius: 12,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
});