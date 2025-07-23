import React, { useEffect, useState } from 'react';
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

  // Fix sensitivity save/load: always send string ('low', 'medium', 'high') and load as string
  useEffect(() => {
    setLoading(true);
    getPreferences()
      .then(prefs => {
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
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load preferences');
        setLoading(false);
      });
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
    try {
      await updatePreferences({
        language: selectedLanguage === 'tagalog' ? 'Tagalog' : selectedLanguage === 'english' ? 'English' : 'Taglish',
        sensitivity: sensitivity.toLowerCase(),
        whitelistSite: whitelist.sites,
        whitelistTerms: whitelist.terms,
        flagStyle,
        isHighlighted: showHighlight,
        color: flagColor,
      });
      setSaving(false);
      setDirty(false);
      setConfirmVisible(false);
      showToast('Settings saved!');
      onClose();
    } catch {
      setError('Failed to save preferences');
      setSaving(false);
      setConfirmVisible(false);
      showToast('Failed to save settings');
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

  // Show loading and error states
  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      <Text style={{ color: '#374151', fontSize: 16 }}>Loading preferences...</Text>
    </View>
  );
  if (error) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
      <Text style={{ color: '#ef4444', fontSize: 16 }}>{error}</Text>
      <TouchableOpacity onPress={() => { setError(''); setLoading(true); getPreferences().then(prefs => { setSelectedLanguage(prefs.language === 'Tagalog' ? 'tagalog' : prefs.language === 'English' ? 'english' : 'both'); setSensitivity(prefs.sensitivity || 'medium'); setWhitelist({ sites: prefs.whitelistSite || [], terms: prefs.whitelistTerms || [] }); setFlagStyle(prefs.flagStyle || 'highlight'); setShowHighlight(!!prefs.isHighlighted); setFlagColor(prefs.color || '#374151'); setLoading(false); }).catch(() => { setError('Failed to load preferences'); setLoading(false); }); }} style={{ marginTop: 20, backgroundColor: '#374151', padding: 12, borderRadius: 8 }}><Text style={{ color: '#fff' }}>Retry</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
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
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#36DCA6" />
            </View>
            <Text style={styles.modalTitleCentered}>Save Changes?</Text>
            <Text style={styles.modalDescCentered}>Are you sure you want to save your changes to extension settings?</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDiscard]} onPress={() => { setConfirmVisible(false); onClose(); }}>
                <Text style={styles.modalBtnDiscardText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleSave}>
                <Text style={styles.modalBtnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove from Whitelist?</Text>
            <Text style={styles.modalDesc}>Are you sure you want to remove &quot;{deleteConfirm.item}&quot; from the whitelist?</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f3f4f6' }]} onPress={() => setDeleteConfirm({ show: false, item: null, type: null })}>
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#374151' }]} onPress={handleRemoveConfirmed}>
                <Text style={{ color: '#fff' }}>Remove</Text>
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
    fontFamily: 'Poppins-Bold',
    color: '#374151',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: '#36DCA6',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#36DCA6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
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
  modalIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0f2fe', // Light blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleCentered: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescCentered: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  modalBtnCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalBtnDiscard: {
    backgroundColor: '#374151',
  },
  modalBtnSave: {
    backgroundColor: '#36DCA6',
  },
  modalBtnCancelText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  modalBtnDiscardText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  modalBtnSaveText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
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
}); 