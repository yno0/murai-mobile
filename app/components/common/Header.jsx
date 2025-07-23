import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Header({ 
  title = 'MURAi', 
  leftIcon = 'menu', 
  leftIconType = 'feather', // 'feather' or 'material'
  onLeftPress, 
  rightContent,
  rightIcon,
  rightIconType = 'material',
  onRightPress,
  showBackButton = false,
  onBackPress,
  style 
}) {
  
  const renderLeftButton = () => {
    if (showBackButton) {
      return (
        <TouchableOpacity style={styles.button} onPress={onBackPress}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
      );
    }
    
    if (onLeftPress) {
      return (
        <TouchableOpacity style={styles.button} onPress={onLeftPress}>
          {leftIconType === 'feather' ? (
            <Feather name={leftIcon} size={24} color="#374151" />
          ) : (
            <MaterialCommunityIcons name={leftIcon} size={24} color="#374151" />
          )}
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.button} />;
  };

  const renderRightContent = () => {
    if (rightContent) {
      return rightContent;
    }
    
    if (rightIcon && onRightPress) {
      return (
        <TouchableOpacity style={styles.button} onPress={onRightPress}>
          {rightIconType === 'feather' ? (
            <Feather name={rightIcon} size={24} color="#374151" />
          ) : (
            <MaterialCommunityIcons name={rightIcon} size={24} color="#374151" />
          )}
        </TouchableOpacity>
      );
    }
    
    return <View style={styles.button} />;
  };

  return (
    <View style={[styles.container, style]}>
      {renderLeftButton()}
      <Text style={styles.title}>{title}</Text>
      {renderRightContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
}); 