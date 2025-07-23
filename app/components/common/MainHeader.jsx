import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MainHeader({
  title = 'MURAi',
  subtitle,
  leftActions = [],
  rightActions = [],
  style
}) {
  
  const renderAction = (action, index) => {
    const isButton = action.onPress;
    
    if (isButton) {
      const iconColor = action.color || '#6B7280';
      return (
        <TouchableOpacity 
          key={index}
          style={styles.actionButton}
          onPress={action.onPress}
        >
          {action.iconType === 'feather' ? (
            <Feather name={action.icon} size={24} color={iconColor} />
          ) : (
            <MaterialCommunityIcons name={action.icon} size={24} color={iconColor} />
          )}
        </TouchableOpacity>
      );
    }
    
    return action.component || null;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left side - Actions and Title */}
      <View style={styles.leftSection}>
        <View style={styles.leftActionsContainer}>
          {leftActions.map((action, index) => renderAction(action, index))}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {/* Right side - Action buttons */}
      <View style={styles.rightSection}>
        {rightActions.map((action, index) => renderAction(action, index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 20,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
}); 