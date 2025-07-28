import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPreferences, updatePreferences } from '../../services/preferences';

const FLAG_STYLES = [
  { id: 'highlight', label: 'Highlight', icon: 'marker' },
  { id: 'blur', label: 'Blur', icon: 'blur' },
  { id: 'asterisk', label: 'Asterisk', icon: 'asterisk' },
];

const LANGUAGES = [
  { id: 'tagalog', label: 'Tagalog' },
  { id: 'english', label: 'English' },
  { id: 'both', label: 'Both' },
];

const COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

const SENSITIVITY_LEVELS = [
  { id: 'low', label: 'Low', desc: 'Least strict filtering, only blocks severe content.' },
  { id: 'medium', label: 'Medium', desc: 'Balanced filtering for most situations.' },
  { id: 'high', label: 'High', desc: 'Most strict, blocks even mild inappropriate content.' },
];

export default function ExtensionSettings({ onClose }) {
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // All settings state
  const [selectedLanguage, setSelectedLanguage] = useState('both');
  const [sensitivity, setSensitivity] = useState('medium');
  const [whitelist, setWhitelist] = useState({ sites: [], terms: [] });
  const [newWhitelistItem, setNewWhitelistItem] = useState('');
  const [whitelistType, setWhitelistType] = useState('sites');
  const [flagStyle, setFlagStyle] = useState('highlight');
  const [showHighlight, setShowHighlight] = useState(true);
  const [flagColor, setFlagColor] = useState('#374151');
  const [dirty, setDirty] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [whitelistError, setWhitelistError] = useState('');
  const [initialPrefs, setInitialPrefs] = useState(null);

  // Load preferences with improved error handling
  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      setError('');

      try {
        const prefs = await getPreferences();

        const loadedPrefs = {
          selectedLanguage: prefs.language === 'Tagalog' ? 'tagalog' : prefs.language === 'English' ? 'english' : 'both',
          sensitivity: (prefs.sensitivity || 'medium').toLowerCase(),
          whitelist: {
            sites: prefs.whitelistSite || [],
            terms: prefs.whitelistTerms || [],
          },
          flagStyle: prefs.flagStyle || 'highlight',
          showHighlight: !!prefs.isHighlighted,
          flagColor: prefs.color || '#374151',
        };

        setSelectedLanguage(loadedPrefs.selectedLanguage);
        setSensitivity(loadedPrefs.sensitivity);
        setWhitelist(loadedPrefs.whitelist);
        setFlagStyle(loadedPrefs.flagStyle);
        setShowHighlight(loadedPrefs.showHighlight);
        setFlagColor(loadedPrefs.flagColor);
        setInitialPrefs(loadedPrefs);

        console.log('Preferences loaded successfully');
      } catch (error) {
        console.error('Error loading preferences:', error);
        setError('Unable to load preferences. Using default settings.');

        // Set default values if loading fails
        const defaultPrefs = {
          selectedLanguage: 'both',
          sensitivity: 'medium',
          whitelist: { sites: [], terms: [] },
          flagStyle: 'highlight',
          showHighlight: true,
          flagColor: '#374151',
        };

        setSelectedLanguage(defaultPrefs.selectedLanguage);
        setSensitivity(defaultPrefs.sensitivity);
        setWhitelist(defaultPrefs.whitelist);
        setFlagStyle(defaultPrefs.flagStyle);
        setShowHighlight(defaultPrefs.showHighlight);
        setFlagColor(defaultPrefs.flagColor);
        setInitialPrefs(defaultPrefs);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Compare current state to initialPrefs
  const isDirty = initialPrefs && (
    selectedLanguage !== initialPrefs.selectedLanguage ||
    sensitivity !== initialPrefs.sensitivity ||
    flagStyle !== initialPrefs.flagStyle ||
    showHighlight !== initialPrefs.showHighlight ||
    flagColor !== initialPrefs.flagColor ||
    JSON.stringify(whitelist.sites) !== JSON.stringify(initialPrefs.whitelist.sites) ||
    JSON.stringify(whitelist.terms) !== JSON.stringify(initialPrefs.whitelist.terms)
  );

  // Mark dirty on any change
  const handleChange = (setter) => (value) => {
    setDirty(true);
    setter(value);
  };

  // Toast helper
  const showToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  // Save preferences after confirmation
  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const prefsToSave = {
        language: selectedLanguage === 'tagalog' ? 'Tagalog' : selectedLanguage === 'english' ? 'English' : 'Both',
        sensitivity: sensitivity.toLowerCase(),
        whitelistSite: whitelist.sites,
        whitelistTerms: whitelist.terms,
        flagStyle,
        isHighlighted: showHighlight,
        color: flagColor,
      };

      await updatePreferences(prefsToSave);

      // Update initial prefs to reflect saved state
      setInitialPrefs({
        selectedLanguage,
        sensitivity,
        whitelist,
        flagStyle,
        showHighlight,
        flagColor,
      });

      setDirty(false);
      setConfirmVisible(false);
      showToast('Settings saved successfully!');

      console.log('Preferences saved successfully');

      // Close after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Changes saved locally.');
      setConfirmVisible(false);
      showToast('Settings saved locally');
    } finally {
      setSaving(false);
    }
  };

  // For whitelist add/remove, set dirty
  const addToWhitelist = () => {
    if (!newWhitelistItem.trim()) {
      setWhitelistError('Please enter a value');
      return;
    }
    const exists = whitelist[whitelistType].some(
      i => i.trim().toLowerCase() === newWhitelistItem.trim().toLowerCase()
    );
    if (exists) {
      setWhitelistError('This entry already exists');
      return;
    }
    setWhitelist(prev => {
      setDirty(true);
      return {
        ...prev,
        [whitelistType]: [...prev[whitelistType], newWhitelistItem.trim()]
      };
    });
    setNewWhitelistItem('');
    setWhitelistError('');
  };

  // Confirmation for delete
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null, type: null });
  const confirmRemoveFromWhitelist = (item, type) => {
    setDeleteConfirm({ show: true, item, type });
  };
  const handleRemoveConfirmed = () => {
    setWhitelist(prev => {
      setDirty(true);
      return {
        ...prev,
        [deleteConfirm.type]: prev[deleteConfirm.type].filter(i => i !== deleteConfirm.item)
      };
    });
    setDeleteConfirm({ show: false, item: null, type: null });
  };

  const removeFromWhitelist = (item, type) => {
    setWhitelist(prev => {
      setDirty(true);
      return {
        ...prev,
        [type]: prev[type].filter(i => i !== item)
      };
    });
  };

  const renderSectionHeader = (icon, title, subtitle) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(54,220,166,0.08)' }]}> {/* #36DCA6 @ 8% */}
        <MaterialCommunityIcons name={icon} size={24} color="#36DCA6" />
      </View>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  // Retry loading preferences
  const retryLoadPreferences = async () => {
    setError('');
    setLoading(true);

    try {
      const prefs = await getPreferences();

      const loadedPrefs = {
        selectedLanguage: prefs.language === 'Tagalog' ? 'tagalog' : prefs.language === 'English' ? 'english' : 'both',
        sensitivity: (prefs.sensitivity || 'medium').toLowerCase(),
        whitelist: {
          sites: prefs.whitelistSite || [],
          terms: prefs.whitelistTerms || [],
        },
        flagStyle: prefs.flagStyle || 'highlight',
        showHighlight: !!prefs.isHighlighted,
        flagColor: prefs.color || '#374151',
      };

      setSelectedLanguage(loadedPrefs.selectedLanguage);
      setSensitivity(loadedPrefs.sensitivity);
      setWhitelist(loadedPrefs.whitelist);
      setFlagStyle(loadedPrefs.flagStyle);
      setShowHighlight(loadedPrefs.showHighlight);
      setFlagColor(loadedPrefs.flagColor);
      setInitialPrefs(loadedPrefs);

    } catch (error) {
      setError('Unable to load preferences. Using default settings.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) return (
    <View style={styles.loadingContainer}>
      <MaterialCommunityIcons name="loading" size={32} color="#36DCA6" />
      <Text style={styles.loadingText}>Loading preferences...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={retryLoadPreferences} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (isDirty) {
              setConfirmVisible(true);
            } else {
              onClose();
            }
          }}
        >
          {saving && (
            <View style={styles.savingIndicator}>
              <MaterialCommunityIcons name="loading" size={24} color="#fff" />
            </View>
          )}
          <MaterialCommunityIcons name="close" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Extension Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={styles.section}>
          {renderSectionHeader(
            "translate",
            "Language",
            "Choose which languages to monitor for inappropriate content"
          )}
          <View style={styles.card}>
            <View style={styles.languageOptions}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.languageOption,
                    selectedLanguage === lang.id && styles.languageOptionActive
                  ]}
                  onPress={() => handleChange(setSelectedLanguage)(lang.id)}
                >
                  <Text style={[
                    styles.languageOptionText,
                    selectedLanguage === lang.id && styles.languageOptionTextActive
                  ]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Sensitivity */}
        <View style={styles.section}>
          {renderSectionHeader(
            "tune",
            "Sensitivity",
            "Choose how strictly the content is filtered."
          )}
          <View style={styles.card}>
            <View style={styles.sensitivityLevelsRow}>
              {SENSITIVITY_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.sensitivityLevelBtn,
                    sensitivity === level.id && styles.sensitivityLevelBtnActive
                  ]}
                  onPress={() => handleChange(setSensitivity)(level.id)}
                >
                  <Text style={[
                    styles.sensitivityLevelText,
                    sensitivity === level.id && styles.sensitivityLevelTextActive
                  ]}>{level.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sensitivityDesc}>
              {SENSITIVITY_LEVELS.find(l => l.id === sensitivity)?.desc}
            </Text>
          </View>
        </View>

        {/* Whitelist */}
        <View style={styles.section}>
          {renderSectionHeader(
            "shield-check",
            "Whitelist",
            "Add websites and terms that should not be filtered"
          )}
          <View style={styles.card}>
            <View style={styles.whitelistTabs}>
              <TouchableOpacity
                style={[styles.whitelistTab, whitelistType === 'sites' && styles.whitelistTabActive]}
                onPress={() => handleChange(setWhitelistType)('sites')}
              >
                <Text style={[styles.whitelistTabText, whitelistType === 'sites' && styles.whitelistTabTextActive]}>
                  Sites
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.whitelistTab, whitelistType === 'terms' && styles.whitelistTabActive]}
                onPress={() => handleChange(setWhitelistType)('terms')}
              >
                <Text style={[styles.whitelistTabText, whitelistType === 'terms' && styles.whitelistTabTextActive]}>
                  Terms
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.whitelistInput}>
              <TextInput
                style={[styles.input, whitelistError ? styles.inputError : null]}
                value={newWhitelistItem}
                onChangeText={txt => { setNewWhitelistItem(txt); if (whitelistError) setWhitelistError(''); }}
                placeholder={`Add ${whitelistType === 'sites' ? 'website' : 'term'}`}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity style={styles.addButton} onPress={addToWhitelist}>
                <MaterialCommunityIcons name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {whitelistError ? <Text style={styles.inputErrorText}>{whitelistError}</Text> : null}

            <FlatList
              data={whitelist[whitelistType]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <View style={styles.whitelistItem}>
                  <Text style={styles.whitelistItemText}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => confirmRemoveFromWhitelist(item, whitelistType)}
                    style={styles.removeButton}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.whitelistList}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Flag Customization */}
        <View style={styles.section}>
          {renderSectionHeader(
            "format-paint",
            "Flag Customization",
            "Choose how inappropriate content should be displayed"
          )}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Flag Style</Text>
            <View style={styles.flagStyles}>
              {FLAG_STYLES.map(style => (
                <TouchableOpacity
                  key={style.id}
                  style={[styles.flagStyle, flagStyle === style.id && styles.flagStyleActive]}
                  onPress={() => handleChange(setFlagStyle)(style.id)}
                >
                  <MaterialCommunityIcons
                    name={style.icon}
                    size={24}
                    color={flagStyle === style.id ? '#fff' : '#374151'}
                  />
                  <Text style={[
                    styles.flagStyleText,
                    flagStyle === style.id && styles.flagStyleTextActive
                  ]}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {flagStyle !== 'highlight' && (
              <View style={styles.settingRow}>
                <View>
                  <Text style={styles.settingLabel}>Show Highlight</Text>
                  <Text style={styles.settingSubtext}>Show a highlight effect with blur/asterisk</Text>
                </View>
                <Switch
                  value={showHighlight}
                  onValueChange={handleChange(setShowHighlight)}
                  trackColor={{ false: '#d1d5db', true: '#374151' }}
                  thumbColor={showHighlight ? '#374151' : '#9ca3af'}
                />
              </View>
            )}

            <Text style={styles.cardLabel}>Flag Color</Text>
            <View style={styles.colorGrid}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    flagColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => handleChange(setFlagColor)(color)}
                >
                  {flagColor === color && (
                    <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Flag Preview */}
            <Text style={styles.cardLabel}>Preview</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>How flagged content will appear:</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>This is some sample text with </Text>
                {flagStyle === 'blur' ? (
                  <View style={[styles.previewFlag, styles.previewBlur, { backgroundColor: flagColor }]}>
                    <Text style={styles.previewFlagText}>inappropriate</Text>
                  </View>
                ) : flagStyle === 'asterisk' ? (
                  <Text style={[styles.previewAsterisk, { color: flagColor }]}>***********</Text>
                ) : (
                  <View style={[styles.previewHighlight, { backgroundColor: flagColor + '30' }]}>
                    <Text style={[styles.previewHighlightText, { color: flagColor }]}>inappropriate</Text>
                  </View>
                )}
                <Text style={styles.previewText}> content in it.</Text>
              </View>
              {showHighlight && flagStyle !== 'highlight' && (
                <View style={styles.previewContent}>
                  <Text style={styles.previewText}>With highlight enabled: </Text>
                  <View style={[styles.previewHighlight, { backgroundColor: flagColor + '30' }]}>
                    {flagStyle === 'blur' ? (
                      <View style={[styles.previewFlag, styles.previewBlur, { backgroundColor: flagColor }]}>
                        <Text style={styles.previewFlagText}>inappropriate</Text>
                      </View>
                    ) : (
                      <Text style={[styles.previewAsterisk, { color: flagColor }]}>***********</Text>
                    )}
                  </View>
                  <Text style={styles.previewText}> content</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      {isDirty && !saving && (
        <TouchableOpacity style={styles.saveButton} onPress={() => setConfirmVisible(true)}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.saveModalContent}>
            <View style={styles.saveModalIconContainer}>
              <MaterialCommunityIcons name="content-save" size={32} color="#36DCA6" />
            </View>
            <Text style={styles.saveModalTitle}>Save Changes?</Text>
            <Text style={styles.saveModalDescription}>
              Your extension settings will be updated and applied immediately.
            </Text>
            <View style={styles.saveModalButtons}>
              <TouchableOpacity
                style={[styles.saveModalButton, styles.saveModalCancelButton]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.saveModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveModalButton, styles.saveModalDiscardButton]}
                onPress={() => { setConfirmVisible(false); onClose(); }}
              >
                <Text style={styles.saveModalDiscardText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveModalButton, styles.saveModalSaveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <MaterialCommunityIcons name="loading" size={16} color="#ffffff" />
                ) : (
                  <Text style={styles.saveModalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={saving}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successModalIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={40} color="#10b981" />
            </View>
            <Text style={styles.successModalTitle}>Saving Settings...</Text>
            <Text style={styles.successModalDescription}>
              Please wait while we update your preferences.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteConfirm.show}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirm({ show: false, item: null, type: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIconContainer}>
              <MaterialCommunityIcons name="delete" size={32} color="#ef4444" />
            </View>
            <Text style={styles.deleteModalTitle}>Remove from Whitelist?</Text>
            <Text style={styles.deleteModalDescription}>
              Are you sure you want to remove "{deleteConfirm.item}" from the whitelist?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalCancelButton]}
                onPress={() => setDeleteConfirm({ show: false, item: null, type: null })}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalRemoveButton]}
                onPress={handleRemoveConfirmed}
              >
                <Text style={styles.deleteModalRemoveText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f8fafc',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#374151',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Add padding to prevent overlap with save button
  },
  section: {
    marginTop: 32,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingLeft: 2,
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 2,
  },
  languageOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 2,
  },
  languageOptionActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  languageOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  languageOptionTextActive: {
    color: '#fff',
  },
  sensitivityContainer: {
    paddingHorizontal: 8,
  },
  sensitivityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensitivityLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  sensitivityValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#6366f1',
  },
  whitelistTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  whitelistTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  whitelistTabActive: {
    backgroundColor: '#374151',
  },
  whitelistTabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  whitelistTabTextActive: {
    color: '#fff',
  },
  whitelistInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: '#374151',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whitelistList: {
    maxHeight: 200,
  },
  whitelistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  whitelistItemText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  removeButton: {
    padding: 4,
  },
  flagStyles: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  flagStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 2,
  },
  flagStyleActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  flagStyleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  flagStyleTextActive: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  settingSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 2,
  },
  colorOptionSelected: {
    borderColor: '#374151',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  sensitivityLevelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  sensitivityLevelBtn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  sensitivityLevelBtnActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  sensitivityLevelText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  sensitivityLevelTextActive: {
    color: '#fff',
  },
  sensitivityDesc: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  saveButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#36DCA6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#36DCA6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  saveModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '90%',
  },
  saveModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  saveModalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  saveModalDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  saveModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveModalCancelButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveModalDiscardButton: {
    backgroundColor: '#ef4444',
  },
  saveModalSaveButton: {
    backgroundColor: '#36DCA6',
  },
  saveModalCancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  saveModalDiscardText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveModalSaveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  successModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '80%',
  },
  successModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successModalDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '90%',
  },
  deleteModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteModalCancelButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteModalRemoveButton: {
    backgroundColor: '#ef4444',
  },
  deleteModalCancelText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteModalRemoveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  inputErrorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loadingText: {
    color: '#374151',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginTop: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginBottom: 0,
  },
  errorBannerText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  previewContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  previewFlag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  previewBlur: {
    opacity: 0.7,
  },
  previewFlagText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  previewAsterisk: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 2,
  },
  previewHighlight: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  previewHighlightText: {
    fontSize: 16,
    fontWeight: '500',
  },
});