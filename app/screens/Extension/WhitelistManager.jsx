import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { updatePreferences } from '../../services/preferences';

const COLORS = {
  PRIMARY: '#02B97F',
  PRIMARY_DARK: '#01A06E',
  BACKGROUND: '#ffffff',
  CARD_BG: '#ffffff',
  TEXT_MAIN: '#111827',
  TEXT_SECONDARY: '#6B7280',
  TEXT_MUTED: '#9CA3AF',
  BORDER: '#E5E7EB',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
};

const WhitelistManager = ({ route, navigation }) => {
  const { type: initialType, sitesData, termsData, onUpdateSites, onUpdateTerms } = route.params;
  const [currentType, setCurrentType] = useState(initialType || 'sites');
  const [sitesItems, setSitesItems] = useState(sitesData || []);
  const [termsItems, setTermsItems] = useState(termsData || []);
  const [newItem, setNewItem] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get current items based on selected type
  const items = currentType === 'sites' ? sitesItems : termsItems;
  const setItems = currentType === 'sites' ? setSitesItems : setTermsItems;
  const onUpdate = currentType === 'sites' ? onUpdateSites : onUpdateTerms;

  // Reset page when switching types
  useEffect(() => {
    setCurrentPage(1);
    setNewItem('');
  }, [currentType]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const addItem = async () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      const updatedItems = [...items, newItem.trim()];
      setItems(updatedItems);
      setNewItem('');
      onUpdate(updatedItems);

      // Save to database
      try {
        const preferences = {};
        if (currentType === 'sites') {
          preferences.whitelistSite = updatedItems;
        } else {
          preferences.whitelistTerms = updatedItems;
        }
        await updatePreferences(preferences);
      } catch (error) {
        console.log('Failed to save to database:', error);
      }
    } else if (items.includes(newItem.trim())) {
      Alert.alert('Duplicate Entry', `This ${currentType.slice(0, -1)} already exists in your whitelist.`);
    }
  };

  const removeItem = (index) => {
    const actualIndex = startIndex + index;
    const itemToRemove = items[actualIndex];

    Alert.alert(
      'Confirm Removal',
      `Are you sure you want to remove "${itemToRemove}" from your whitelist?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedItems = items.filter((_, i) => i !== actualIndex);
            setItems(updatedItems);
            onUpdate(updatedItems);

            // Save to database
            try {
              const preferences = {};
              if (currentType === 'sites') {
                preferences.whitelistSite = updatedItems;
              } else {
                preferences.whitelistTerms = updatedItems;
              }
              await updatePreferences(preferences);
            } catch (error) {
              console.log('Failed to save to database:', error);
            }

            // Adjust page if current page becomes empty
            if (currentItems.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.listItem}>
      <MaterialCommunityIcons
        name={currentType === 'sites' ? 'web' : 'text'}
        size={20}
        color={COLORS.PRIMARY}
      />
      <Text style={styles.listItemText}>{item}</Text>
      <TouchableOpacity
        onPress={() => removeItem(index)}
        style={styles.removeButton}
      >
        <MaterialCommunityIcons name="close" size={20} color={COLORS.ERROR} />
      </TouchableOpacity>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={20}
            color={currentPage === 1 ? COLORS.TEXT_MUTED : COLORS.PRIMARY}
          />
        </TouchableOpacity>

        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
          <Text style={styles.paginationSubtext}>
            {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} items
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={currentPage === totalPages ? COLORS.TEXT_MUTED : COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Whitelist {currentType === 'sites' ? 'Sites' : 'Terms'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentType === 'sites' && styles.toggleButtonActive
          ]}
          onPress={() => setCurrentType('sites')}
        >
          <MaterialCommunityIcons
            name="web"
            size={18}
            color={currentType === 'sites' ? '#ffffff' : COLORS.PRIMARY}
          />
          <Text style={[
            styles.toggleButtonText,
            currentType === 'sites' && styles.toggleButtonTextActive
          ]}>
            Sites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentType === 'terms' && styles.toggleButtonActive
          ]}
          onPress={() => setCurrentType('terms')}
        >
          <MaterialCommunityIcons
            name="text"
            size={18}
            color={currentType === 'terms' ? '#ffffff' : COLORS.PRIMARY}
          />
          <Text style={[
            styles.toggleButtonText,
            currentType === 'terms' && styles.toggleButtonTextActive
          ]}>
            Terms
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.addSection}>
          <Text style={styles.addSectionTitle}>
            Add New {currentType === 'sites' ? 'Site' : 'Term'}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newItem}
              onChangeText={setNewItem}
              placeholder={currentType === 'sites' ? 'Enter website (e.g., example.com)' : 'Enter term to whitelist'}
              placeholderTextColor={COLORS.TEXT_MUTED}
            />
            <TouchableOpacity
              style={[styles.addButton, !newItem.trim() && styles.addButtonDisabled]}
              onPress={addItem}
              disabled={!newItem.trim()}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listSectionTitle}>
            Current {currentType === 'sites' ? 'Sites' : 'Terms'} ({items.length})
          </Text>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={currentType === 'sites' ? 'web-off' : 'text-box-remove'}
                size={48}
                color={COLORS.TEXT_MUTED}
              />
              <Text style={styles.emptyStateText}>
                No {currentType === 'sites' ? 'sites' : 'terms'} added yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Add {currentType === 'sites' ? 'trusted websites' : 'terms'} that should not be flagged
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={currentItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.list}
                showsVerticalScrollIndicator={false}
              />
              {renderPagination()}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: COLORS.TEXT_MAIN,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addSection: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  addSectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MAIN,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: COLORS.TEXT_MUTED,
  },
  listSection: {
    flex: 1,
  },
  listSectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MAIN,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_MUTED,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    marginTop: 16,
  },
  paginationButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  paginationButtonDisabled: {
    backgroundColor: COLORS.CARD_BG,
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.TEXT_MAIN,
  },
  paginationSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.PRIMARY,
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
});

export default WhitelistManager;
