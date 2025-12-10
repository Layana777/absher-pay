import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const QuickFilters = ({ activeFilter, onFilterSelect }) => {
  const filters = [
    { id: '7d', label: 'آخر 7 أيام' },
    { id: '30d', label: 'آخر 30 يوم' },
    { id: '90d', label: 'آخر 90 يوم' }
  ];

  return (
    <View className="flex-row gap-2 mb-4">
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => onFilterSelect(filter.id)}
          className={`flex-1 py-3 rounded-2xl border ${
            activeFilter === filter.id
              ? 'bg-[#0055aa] border-[#0055aa]'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              activeFilter === filter.id ? 'text-white' : 'text-gray-700'
            }`}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default QuickFilters;
