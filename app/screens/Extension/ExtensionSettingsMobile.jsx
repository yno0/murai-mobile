import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const ACCENT_DARK = "#059669";
const TEXT_MAIN = "#fff";
const TEXT_SECONDARY = "#a0a0a0";
const GRAY_BTN = "#2a2a2a";
const CARD_RADIUS = 16;
const COLORS = [ACCENT, "#10b981", "#059669"]; // gradient shades of accent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: TEXT_MAIN,
    flex: 1,
  },
  backButton: {
    marginRight: 18,
    padding: 8,
    borderRadius: 12,
    backgroundColor: GRAY_BTN,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: TEXT_MAIN,
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: CARD_BG,
    borderRadius: CARD_RADIUS,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginTop: 12,
  },
  input: {
    backgroundColor: GRAY_BTN,
    color: TEXT_MAIN,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  colorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    marginBottom: 14,
    padding: 2,
  },
  colorButtonInner: {
    flex: 1,
    borderRadius: 20,
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
    borderRadius: 20,
    padding: 28,
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

export default function ExtensionSettingsMobile({ navigation }) {
  const [expanded, setExpanded] = useState('Protection');
  const [enabled, setEnabled] = useState(true);
  const [language, setLanguage] = useState("Mixed");
  const [sensitivity, setSensitivity] = useState("High");
  const [terms, setTerms] = useState(["spam"]);
  const [websites, setWebsites] = useState(["example.com"]);
  const [modal, setModal] = useState({ visible: false, type: '', idx: null });
  const [editValue, setEditValue] = useState("");
  const [flagStyle, setFlagStyle] = useState("Highlight");
  const [showHighlight, setShowHighlight] = useState(true);
  const [color, setColor] = useState(COLORS[0]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Extension Settings</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 22, paddingBottom: 50 }}>
        <SectionAccordion
          title="Protection"
          icon={<Feather name="shield" size={22} color={ACCENT} />}
          expanded={expanded === 'Protection'}
          onPress={() => setExpanded(expanded === 'Protection' ? '' : 'Protection')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN }}>Enable Protection</Text>
            <Switch 
              value={enabled} 
              onValueChange={setEnabled} 
              trackColor={{ false: GRAY_BTN, true: ACCENT_DARK }}
              thumbColor={enabled ? ACCENT : '#666'}
              ios_backgroundColor={GRAY_BTN}
            />
          </View>
        </SectionAccordion>

        <SectionAccordion
          title="Language"
          icon={<Feather name="globe" size={22} color={ACCENT} />}
          expanded={expanded === 'Language'}
          onPress={() => setExpanded(expanded === 'Language' ? '' : 'Language')}
        >
          <Segmented options={["Tagalog", "English", "Mixed"]} value={language} onChange={setLanguage} />
        </SectionAccordion>

        <SectionAccordion
          title="Sensitivity"
          icon={<Feather name="activity" size={22} color={ACCENT} />}
          expanded={expanded === 'Sensitivity'}
          onPress={() => setExpanded(expanded === 'Sensitivity' ? '' : 'Sensitivity')}
        >
          <Segmented options={["Low", "Medium", "High"]} value={sensitivity} onChange={setSensitivity} />
        </SectionAccordion>

        <SectionAccordion
          title="Whitelist"
          icon={<Feather name="list" size={22} color={ACCENT} />}
          expanded={expanded === 'Whitelist'}
          onPress={() => setExpanded(expanded === 'Whitelist' ? '' : 'Whitelist')}
        >
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN, marginBottom: 12 }}>Terms</Text>
            {terms.map((term, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flex: 1, backgroundColor: GRAY_BTN, borderRadius: 12, padding: 2 }}>
                  <Text style={{ color: TEXT_MAIN, fontSize: 16, padding: 12 }}>{term}</Text>
                </View>
                <TouchableOpacity onPress={() => openEdit('term', idx, term)} style={{ marginLeft: 12, padding: 8, backgroundColor: GRAY_BTN, borderRadius: 10 }}>
                  <Feather name="edit-2" size={18} color={ACCENT} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              onPress={() => setTerms([...terms, ""])} 
              style={{ 
                marginTop: 12,
                alignSelf: 'flex-end',
                backgroundColor: ACCENT,
                borderRadius: 12,
                padding: 12
              }}
            >
              <Feather name="plus" size={20} color={BG} />
            </TouchableOpacity>

            <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN, marginBottom: 12, marginTop: 24 }}>Websites</Text>
            {websites.map((site, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flex: 1, backgroundColor: GRAY_BTN, borderRadius: 12, padding: 2 }}>
                  <Text style={{ color: TEXT_MAIN, fontSize: 16, padding: 12 }}>{site}</Text>
                </View>
                <TouchableOpacity onPress={() => openEdit('website', idx, site)} style={{ marginLeft: 12, padding: 8, backgroundColor: GRAY_BTN, borderRadius: 10 }}>
                  <Feather name="edit-2" size={18} color={ACCENT} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              onPress={() => setWebsites([...websites, ""])} 
              style={{ 
                marginTop: 12,
                alignSelf: 'flex-end',
                backgroundColor: ACCENT,
                borderRadius: 12,
                padding: 12
              }}
            >
              <Feather name="plus" size={20} color={BG} />
            </TouchableOpacity>
          </View>
        </SectionAccordion>

        <SectionAccordion
          title="UI Customization"
          icon={<Feather name="sliders" size={22} color={ACCENT} />}
          expanded={expanded === 'UI Customization'}
          onPress={() => setExpanded(expanded === 'UI Customization' ? '' : 'UI Customization')}
        >
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN, marginBottom: 12 }}>Flag Style</Text>
            <Segmented options={["Asterisk", "Blur", "Highlight"]} value={flagStyle} onChange={setFlagStyle} />
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN, flex: 1 }}>Show Highlight</Text>
              <Switch 
                value={showHighlight} 
                onValueChange={setShowHighlight} 
                trackColor={{ false: GRAY_BTN, true: ACCENT_DARK }}
                thumbColor={showHighlight ? ACCENT : '#666'}
                ios_backgroundColor={GRAY_BTN}
              />
            </View>

            <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN, marginBottom: 12 }}>Choose Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <LinearGradient
                  key={c}
                  colors={[c, ACCENT_DARK]}
                  style={styles.colorButton}
                >
                  <TouchableOpacity
                    onPress={() => setColor(c)}
                    style={[
                      styles.colorButtonInner,
                      color === c && { borderColor: TEXT_MAIN }
                    ]}
                  />
                </LinearGradient>
              ))}
            </View>
          </View>
        </SectionAccordion>

        {/* Preview Section */}
        <View style={[styles.sectionContent, { marginTop: 24, marginBottom: 50 }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: TEXT_MAIN, marginBottom: 16 }}>Preview</Text>
          <View style={{ backgroundColor: GRAY_BTN, borderRadius: 12, minHeight: 80, marginBottom: 4 }} />
        </View>
      </ScrollView>

      {/* Modal for Edit/Delete */}
      <Modal visible={modal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: TEXT_MAIN, marginBottom: 20 }}>
              Edit {modal.type === 'term' ? 'Term' : 'Website'}
            </Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={styles.input}
              placeholderTextColor={TEXT_SECONDARY}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                onPress={deleteItem} 
                style={[styles.button, { backgroundColor: '#ff4444' }]}
              >
                <Text style={[styles.buttonText, { color: TEXT_MAIN }]}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setModal({ visible: false, type: '', idx: null })} 
                style={[styles.button, { backgroundColor: GRAY_BTN }]}
              >
                <Text style={[styles.buttonText, { color: TEXT_SECONDARY }]}>Cancel</Text>
              </TouchableOpacity>
              <LinearGradient
                colors={[ACCENT, ACCENT_DARK]}
                style={[styles.button, { padding: 2 }]}
              >
                <TouchableOpacity
                  onPress={saveEdit}
                  style={{ 
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                  }}
                >
                  <Text style={[styles.buttonText, { color: BG }]}>Save</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 