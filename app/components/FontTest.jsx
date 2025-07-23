import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

export default function FontTest() {
  const fontTests = [
    { name: 'Poppins-Thin', family: 'Poppins-Thin' },
    { name: 'Poppins-ExtraLight', family: 'Poppins-ExtraLight' },
    { name: 'Poppins-Light', family: 'Poppins-Light' },
    { name: 'Poppins-Regular', family: 'Poppins-Regular' },
    { name: 'Poppins-Medium', family: 'Poppins-Medium' },
    { name: 'Poppins-SemiBold', family: 'Poppins-SemiBold' },
    { name: 'Poppins-Bold', family: 'Poppins-Bold' },
    { name: 'Poppins-ExtraBold', family: 'Poppins-ExtraBold' },
    { name: 'Poppins-Black', family: 'Poppins-Black' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.BG, padding: 20 }}>
      <Text style={{ 
        color: COLORS.TEXT_MAIN, 
        fontSize: 24, 
        fontFamily: 'Poppins-Bold',
        marginBottom: 20,
        textAlign: 'center'
      }}>
        Poppins Font Test
      </Text>
      
      {fontTests.map((font, index) => (
        <View key={index} style={{ marginBottom: 15 }}>
          <Text style={{ 
            color: COLORS.TEXT_MAIN, 
            fontSize: 18, 
            fontFamily: font.family,
            marginBottom: 5
          }}>
            {font.name} - The quick brown fox jumps over the lazy dog
          </Text>
          <Text style={{ 
            color: COLORS.TEXT_MUTED, 
            fontSize: 12, 
            fontFamily: 'Poppins-Regular'
          }}>
            Font Family: {font.family}
          </Text>
        </View>
      ))}
      
      <View style={{ marginTop: 30, padding: 15, backgroundColor: COLORS.CARD_BG, borderRadius: 8 }}>
        <Text style={{ 
          color: COLORS.TEXT_MAIN, 
          fontSize: 16, 
          fontFamily: 'Poppins-SemiBold',
          marginBottom: 10
        }}>
          Font Loading Status:
        </Text>
        <Text style={{ 
          color: COLORS.TEXT_MUTED, 
          fontSize: 14, 
          fontFamily: 'Poppins-Regular'
        }}>
          Check the console for font loading status. If you see different font weights above, Poppins is working correctly.
        </Text>
      </View>
    </ScrollView>
  );
} 