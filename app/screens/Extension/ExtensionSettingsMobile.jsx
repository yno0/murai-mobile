import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../../components/common/Header";
import { COLORS } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BG = COLORS.BG;
const CARD_BG = COLORS.CARD_BG;
const ACCENT = COLORS.ACCENT;
const ACCENT_DARK = COLORS.ACCENT_DARK;
const TEXT_MAIN = COLORS.TEXT_MAIN;
const TEXT_SECONDARY = COLORS.TEXT_SECONDARY;
const GRAY_BTN = COLORS.GRAY_BTN;
const CARD_RADIUS = 16;
const GRADIENT_COLORS = [ACCENT, "#10b981", "#059669"]; // gradient shades of accent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // reduced from 22
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22, // reduced from 24
    color: TEXT_MAIN,
    flex: 1,
  },
  backButton: {
    marginRight: 12, // reduced from 18
    padding: 6, // reduced from 8
    borderRadius: 10, // reduced from 12
    backgroundColor: GRAY_BTN,
  },
  section: {
    marginBottom: 16, // reduced from 28
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12, // reduced from 18
    paddingHorizontal: 0, // reduced from 4
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontWeight: 'bold',
    fontSize: 16, // reduced from 18
    color: TEXT_MAIN,
    marginLeft: 10, // reduced from 12
  },
  sectionContent: {
    backgroundColor: CARD_BG,
    borderRadius: CARD_RADIUS,
    padding: 14, // reduced from 20
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 8, // reduced from 12
  },
  input: {
    backgroundColor: GRAY_BTN,
    color: TEXT_MAIN,
    borderRadius: 10, // reduced from 12
    padding: 12, // reduced from 16
    fontSize: 15, // reduced from 16
    marginBottom: 16, // reduced from 24
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  button: {
    borderRadius: 10, // reduced from 12
    paddingVertical: 10, // reduced from 14
    paddingHorizontal: 18, // reduced from 24
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15, // reduced from 16
  },
  colorButton: {
    width: 38, // reduced from 44
    height: 38, // reduced from 44
    borderRadius: 19, // reduced from 22
    marginRight: 10, // reduced from 14
    marginBottom: 10, // reduced from 14
    padding: 2,
  },
  colorButtonInner: {
    flex: 1,
    borderRadius: 16, // reduced from 20
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 18, // reduced from 20
    padding: 20, // reduced from 28
    width: SCREEN_WIDTH * 0.85,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});

const SectionAccordion = ({ title, icon, expanded, onPress, children }) => (
  <View style={styles.section}>
    <TouchableOpacity onPress={onPress} style={styles.sectionHeader}>
      <View style={styles.sectionTitle}>
        <View style={{ padding: 8, backgroundColor: GRAY_BTN, borderRadius: 10 }}>
          {icon}
        </View>
        <Text style={styles.sectionTitleText}>{title}</Text>
      </View>
      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={24} color={ACCENT} />
    </TouchableOpacity>
    {expanded && <View style={styles.sectionContent}>{children}</View>}
    <View style={styles.divider} />
  </View>
);

const Segmented = ({ options, value, onChange }) => (
  <View style={{ flexDirection: 'row', backgroundColor: GRAY_BTN, borderRadius: 12, padding: 4, marginVertical: 8 }}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt}
        onPress={() => onChange(opt)}
        style={{
          flex: 1,
          backgroundColor: value === opt ? ACCENT : 'transparent',
          borderRadius: 10,
          paddingVertical: 12,
          alignItems: 'center',
        }}>
        <Text style={{ 
          color: value === opt ? BG : TEXT_SECONDARY, 
          fontWeight: value === opt ? 'bold' : 'normal',
          fontSize: 15 
        }}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const CARD_STYLE = {
  backgroundColor: CARD_BG,
  borderRadius: 14,
  padding: 16,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 1,
  width: '100%',
  maxWidth: 500,
  alignSelf: 'center',
};

export default function ExtensionSettingsMobile({ navigation }) {
  const [expanded, setExpanded] = useState('Protection');
  const [enabled, setEnabled] = useState(true);
  const [language, setLanguage] = useState("Taglish"); // Use 'Taglish' instead of 'Mixed'
  const [sensitivity, setSensitivity] = useState("High");
  const [terms, setTerms] = useState(["spam"]);
  const [websites, setWebsites] = useState(["example.com"]);
  const [modal, setModal] = useState({ visible: false, type: '', idx: null });
  const [editValue, setEditValue] = useState("");
  const flagStyleOptions = ["asterisk", "blur", "highlight"]; // Only use valid enum values, all lowercase
  const [flagStyle, setFlagStyle] = useState("highlight"); // Default to lowercase
  const [showHighlight, setShowHighlight] = useState(true);
  const [color, setColor] = useState(GRADIENT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:3000/api/users/preferences', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLanguage(data.language || "Taglish");
          setTerms(data.whitelistTerms || []);
          setWebsites(data.whitelistSite || []);
          setFlagStyle((data.flagStyle || "highlight").toLowerCase());
          setShowHighlight(data.isHighlighted ?? true);
          setColor(data.color || GRADIENT_COLORS[0]);
        }
      } catch (e) {
        setError("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  // Save preferences handler
  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('http://localhost:3000/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          whitelistTerms: terms,
          whitelistSite: websites,
          flagStyle: flagStyle.toLowerCase(), // Always send lowercase
          isHighlighted: showHighlight,
          color,
        })
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      setSuccess("Settings saved!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (e) {
      setError(e.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openEdit = (type, idx, value) => { setModal({ visible: true, type, idx }); setEditValue(value); };
  const saveEdit = () => {
    if (modal.type === 'term') setTerms(terms.map((v, i) => i === modal.idx ? editValue : v));
    if (modal.type === 'website') setWebsites(websites.map((v, i) => i === modal.idx ? editValue : v));
    setModal({ visible: false, type: '', idx: null });
  };
  const deleteItem = () => {
    if (modal.type === 'term') setTerms(terms.filter((_, i) => i !== modal.idx));
    if (modal.type === 'website') setWebsites(websites.filter((_, i) => i !== modal.idx));
    setModal({ visible: false, type: '', idx: null });
  };

  // Preview text and style logic
  const previewText = "This is a sample text with some flagged content to show how the blur style will appear. The flagged words will be displayed according to your selected preferences.";
  const flaggedWord = "flagged content";
  const highlightColors = [
    { color: '#fde047', label: 'Yellow' },
    { color: '#fca5a5', label: 'Red' },
    { color: '#bbf7d0', label: 'Green' },
    { color: '#e0e7ef', label: 'Blue' },
    { color: '#d1d5db', label: 'Gray' },
  ];
  const selectedHighlightColor = color;

  const renderFlagged = useMemo(() => {
    if (flagStyle === 'Asterisk') {
      return <Text style={{ color: ACCENT, fontWeight: 'bold' }}>{'*'.repeat(flaggedWord.length)}</Text>;
    } else if (flagStyle === 'Blur') {
      return <Text style={{
        backgroundColor: showHighlight ? selectedHighlightColor : 'transparent',
        color: 'transparent',
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 6,
        borderRadius: 4,
        paddingHorizontal: 4,
        overflow: 'hidden',
      }}>{flaggedWord}</Text>;
    } else if (flagStyle === 'Highlight') {
      return <Text style={{
        backgroundColor: showHighlight ? selectedHighlightColor : 'transparent',
        color: TEXT_MAIN,
        borderRadius: 4,
        paddingHorizontal: 4,
        fontWeight: 'bold',
      }}>{flaggedWord}</Text>;
    }
    return <Text>{flaggedWord}</Text>;
  }, [flagStyle, showHighlight, selectedHighlightColor]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Extension Settings" showBack onBack={() => navigation?.goBack?.()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, alignItems: 'center', paddingBottom: 32 }}>
        {/* Protection Section */}
        {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
        {loading ? <Text style={{ color: ACCENT, marginBottom: 10 }}>Loading...</Text> : null}
        <View style={CARD_STYLE}>
          <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 17, marginBottom: 12 }}>Protection</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: TEXT_MAIN, fontSize: 15 }}>Enable Protection</Text>
            <Switch 
              value={enabled} 
              onValueChange={setEnabled} 
              trackColor={{ false: GRAY_BTN, true: ACCENT_DARK }}
              thumbColor={enabled ? ACCENT : '#666'}
              ios_backgroundColor={GRAY_BTN}
            />
          </View>
        </View>
        {/* Language & Sensitivity Section */}
        <View style={[CARD_STYLE, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }]}> 
          <View style={{ flex: 1, minWidth: 150, marginRight: 8 }}>
            <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 17, marginBottom: 8 }}>Language</Text>
            <Segmented options={["Tagalog", "English", "Taglish"]} value={language} onChange={setLanguage} />
          </View>
          <View style={{ flex: 1, minWidth: 150, marginLeft: 8 }}>
            <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 17, marginBottom: 8 }}>Sensitivity</Text>
            <Segmented options={["Low", "Medium", "High"]} value={sensitivity} onChange={setSensitivity} />
          </View>
        </View>
        {/* Whitelist Section */}
        <View style={CARD_STYLE}>
          <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 17, marginBottom: 12 }}>Whitelist</Text>
          <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>Terms</Text>
          {terms.map((term, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1, backgroundColor: GRAY_BTN, borderRadius: 10, padding: 2 }}>
                <Text style={{ color: TEXT_MAIN, fontSize: 15, padding: 10 }}>{term}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit('term', idx, term)} style={{ marginLeft: 8, padding: 6, backgroundColor: GRAY_BTN, borderRadius: 8 }}>
                <Feather name="edit-2" size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            onPress={() => setTerms([...terms, ""])} 
            style={{ 
              marginTop: 8,
              alignSelf: 'flex-end',
              backgroundColor: ACCENT,
              borderRadius: 10,
              padding: 10
            }}
          >
            <Feather name="plus" size={18} color={BG} />
          </TouchableOpacity>
          <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 15, marginBottom: 8, marginTop: 16 }}>Websites</Text>
          {websites.map((site, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1, backgroundColor: GRAY_BTN, borderRadius: 10, padding: 2 }}>
                <Text style={{ color: TEXT_MAIN, fontSize: 15, padding: 10 }}>{site}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit('website', idx, site)} style={{ marginLeft: 8, padding: 6, backgroundColor: GRAY_BTN, borderRadius: 8 }}>
                <Feather name="edit-2" size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity 
            onPress={() => setWebsites([...websites, ""])} 
            style={{ 
              marginTop: 8,
              alignSelf: 'flex-end',
              backgroundColor: ACCENT,
              borderRadius: 10,
              padding: 10
            }}
          >
            <Feather name="plus" size={18} color={BG} />
          </TouchableOpacity>
        </View>
        {/* UI Customization Section */}
        <View style={[CARD_STYLE, { paddingBottom: 20 }]}> 
          <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 17, marginBottom: 16, letterSpacing: 0.2 }}>UI Customization</Text>
          {/* Preview Card */}
          <View style={{ backgroundColor: '#23272e', borderRadius: 12, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'flex-start' }}>
            <Text style={{ color: TEXT_SECONDARY, fontSize: 13, marginBottom: 6, fontWeight: 'bold' }}>Preview:</Text>
            <Text style={{ color: TEXT_MAIN, fontSize: 15, lineHeight: 22 }}>
              This is a sample text with some {renderFlagged} to show how the {flagStyle.toLowerCase()} style will appear. The flagged words will be displayed according to your selected preferences.
            </Text>
          </View>
          {/* Controls Group */}
          <View style={{ gap: 16 }}>
            {/* Flag Style */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>Flag Style</Text>
              <Segmented options={flagStyleOptions.map(opt => opt.charAt(0).toUpperCase() + opt.slice(1))} value={flagStyle.charAt(0).toUpperCase() + flagStyle.slice(1)} onChange={val => setFlagStyle(val.toLowerCase())} />
            </View>
            {/* Show Highlight */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
              <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 14, flex: 1 }}>Show Highlight</Text>
              <Switch 
                value={showHighlight} 
                onValueChange={setShowHighlight} 
                trackColor={{ false: GRAY_BTN, true: ACCENT_DARK }}
                thumbColor={showHighlight ? ACCENT : '#666'}
                ios_backgroundColor={GRAY_BTN}
              />
            </View>
            {/* Highlight Color */}
            <View style={{ marginBottom: 0 }}>
              <Text style={{ color: TEXT_MAIN, fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>Highlight Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
                {highlightColors.map((c, idx) => (
                  <TouchableOpacity
                    key={c.color}
                    onPress={() => setColor(c.color)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: c.color,
                      marginRight: 10,
                      borderWidth: color === c.color ? 2 : 1,
                      borderColor: color === c.color ? ACCENT : '#e5e7eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {color === c.color && (
                      <Feather name="check" size={17} color={ACCENT_DARK} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
        {/* Save Button */}
        {success ? <Text style={{ color: 'green', marginBottom: 10 }}>{success}</Text> : null}
        <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: ACCENT, marginTop: 20 }]} 
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: BG }]}>{loading ? 'Saving...' : 'Save Settings'}</Text>
        </TouchableOpacity>
        {/* Modal for Edit/Delete */}
        <Modal visible={modal.visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { padding: 16, borderRadius: 12 }]}> 
              <Text style={{ fontWeight: 'bold', fontSize: 17, color: TEXT_MAIN, marginBottom: 14 }}>
                Edit {modal.type === 'term' ? 'Term' : 'Website'}
              </Text>
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                style={[styles.input, { marginBottom: 10 }]}
                placeholderTextColor={TEXT_SECONDARY}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  onPress={deleteItem} 
                  style={[styles.button, { backgroundColor: '#ff4444', paddingHorizontal: 12 }]}
                >
                  <Text style={[styles.buttonText, { color: TEXT_MAIN }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setModal({ visible: false, type: '', idx: null })} 
                  style={[styles.button, { backgroundColor: GRAY_BTN, paddingHorizontal: 12 }]}
                >
                  <Text style={[styles.buttonText, { color: TEXT_SECONDARY }]}>Cancel</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={[ACCENT, ACCENT_DARK]}
                  style={[styles.button, { padding: 2, borderRadius: 8 }]}
                >
                  <TouchableOpacity
                    onPress={saveEdit}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={[styles.buttonText, { color: BG }]}>Save</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
} 