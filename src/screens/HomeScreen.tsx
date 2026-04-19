import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CONVERSIONS } from '../utils/constants';

const RECENT_TOOLS = CONVERSIONS.slice(0, 6);

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="pt-4 pb-6">
          <Text className="text-3xl font-bold text-white">
            PDF <Text className="text-primary">Converter</Text>
          </Text>
          <Text className="text-slate-400 mt-1">Convert, compress & scan documents</Text>
        </View>

        {/* Quick Action Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Scanner')}
          className="bg-primary rounded-2xl p-5 mb-6 flex-row items-center">
          <Icon name="scan-helper" size={40} color="white" />
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Scan Document</Text>
            <Text className="text-red-200 text-sm mt-1">Use camera to scan & convert instantly</Text>
          </View>
          <Icon name="chevron-right" size={24} color="white" />
        </TouchableOpacity>

        {/* Popular Conversions */}
        <Text className="text-white text-lg font-bold mb-3">Popular Conversions</Text>
        <FlatList
          data={RECENT_TOOLS}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Tools')}
              className="flex-1 bg-secondary rounded-xl p-4 items-center">
              <Icon name={item.icon} size={30} color="#E63946" />
              <Text className="text-white text-xs font-semibold mt-2 text-center">{item.label}</Text>
            </TouchableOpacity>
          )}
        />

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}