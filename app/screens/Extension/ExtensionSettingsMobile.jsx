import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, SafeAreaView, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

const ACCENT = "#2563eb";
const CARD_BG = "#fff";
const CARD_RADIUS = 12;
const COLORS = ["#ffd6d6", "#d6ffe0", "#fff9d6", "#ffe7d6", "#f6d6ff", "#ffd6e0", "#e0e0e0"];

const SectionAccordion = ({ title, icon, expanded, onPress, children }) => (
  <View style={{ marginBottom: 18 }}>
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text style={{ fontWeight: 'bold', fontSize: 17, marginLeft: 10 }}>{title}</Text>
      </View>
      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={22} color={ACCENT} />
    </TouchableOpacity>
    {expanded && <View style={{ backgroundColor: CARD_BG, borderRadius: CARD_RADIUS, marginTop: 2, padding: 0, borderWidth: 1, borderColor: '#f0f0f0' }}>{children}</View>}
    <View style={{ height: 1, backgroundColor: '#f0f0f0', marginTop: 8 }} />
  </View>
);

const Segmented = ({ options, value, onChange }) => (
  <View style={{ flexDirection: 'row', backgroundColor: '#f4f5f7', borderRadius: 8, marginVertical: 6 }}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt}
        onPress={() => onChange(opt)}
        style={{
          flex: 1,
          backgroundColor: value === opt ? ACCENT : 'transparent',
          borderRadius: 8,
          paddingVertical: 10,
          alignItems: 'center',
        }}>
        <Text style={{ color: value === opt ? '#fff' : '#222', fontWeight: value === opt ? 'bold' : 'normal', fontSize: 15 }}>{opt}</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      {/* Minimal Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={24} color={ACCENT} />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 19, color: ACCENT, flex: 1 }}>Extension Settings</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {/* Accordion Sections */}
        <SectionAccordion
          title="Protection"
          icon={<Feather name="shield" size={20} color={ACCENT} />}
          expanded={expanded === 'Protection'}
          onPress={() => setExpanded(expanded === 'Protection' ? '' : 'Protection')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Enable Protection</Text>
            <Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#e0e0e0', true: ACCENT }} thumbColor={enabled ? ACCENT : '#e0e0e0'} />
          </View>
        </SectionAccordion>
        <SectionAccordion
          title="Language"
          icon={<Feather name="globe" size={20} color={ACCENT} />}
          expanded={expanded === 'Language'}
          onPress={() => setExpanded(expanded === 'Language' ? '' : 'Language')}
        >
          <View style={{ padding: 18 }}>
            <Segmented options={["Tagalog", "English", "Mixed"]} value={language} onChange={setLanguage} />
          </View>
        </SectionAccordion>
        <SectionAccordion
          title="Sensitivity"
          icon={<Feather name="activity" size={20} color={ACCENT} />}
          expanded={expanded === 'Sensitivity'}
          onPress={() => setExpanded(expanded === 'Sensitivity' ? '' : 'Sensitivity')}
        >
          <View style={{ padding: 18 }}>
            <Segmented options={["Low", "Medium", "High"]} value={sensitivity} onChange={setSensitivity} />
          </View>
        </SectionAccordion>
        <SectionAccordion
          title="Whitelist"
          icon={<Feather name="list" size={20} color={ACCENT} />}
          expanded={expanded === 'Whitelist'}
          onPress={() => setExpanded(expanded === 'Whitelist' ? '' : 'Whitelist')}
        >
          <View style={{ padding: 18 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Terms</Text>
            {terms.map((term, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ flex: 1, backgroundColor: '#f4f5f7', borderRadius: 8, padding: 10, fontSize: 15 }}>{term}</Text>
                <TouchableOpacity onPress={() => openEdit('term', idx, term)} style={{ marginLeft: 6 }}>
                  <Feather name="edit-2" size={18} color={ACCENT} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setTerms([...terms, ""])} style={{ marginTop: 8, alignSelf: 'flex-end', backgroundColor: ACCENT, borderRadius: 8, padding: 8 }}>
              <Feather name="plus" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6, marginTop: 18 }}>Websites</Text>
            {websites.map((site, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ flex: 1, backgroundColor: '#f4f5f7', borderRadius: 8, padding: 10, fontSize: 15 }}>{site}</Text>
                <TouchableOpacity onPress={() => openEdit('website', idx, site)} style={{ marginLeft: 6 }}>
                  <Feather name="edit-2" size={18} color={ACCENT} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setWebsites([...websites, ""])} style={{ marginTop: 8, alignSelf: 'flex-end', backgroundColor: ACCENT, borderRadius: 8, padding: 8 }}>
              <Feather name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </SectionAccordion>
        <SectionAccordion
          title="UI Customization"
          icon={<Feather name="sliders" size={20} color={ACCENT} />}
          expanded={expanded === 'UI Customization'}
          onPress={() => setExpanded(expanded === 'UI Customization' ? '' : 'UI Customization')}
        >
          <View style={{ padding: 18 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Flag Style</Text>
            <Segmented options={["Asterisk", "Blur", "Highlight"]} value={flagStyle} onChange={setFlagStyle} />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, flex: 1 }}>Show Highlight</Text>
              <Switch value={showHighlight} onValueChange={setShowHighlight} trackColor={{ false: '#e0e0e0', true: ACCENT }} thumbColor={showHighlight ? ACCENT : '#e0e0e0'} />
            </View>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 6 }}>Choose Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, marginRight: 10, marginBottom: 10, borderWidth: color === c ? 2 : 0, borderColor: ACCENT }} />
              ))}
            </View>
          </View>
        </SectionAccordion>
        {/* Preview Section */}
        <View style={{ backgroundColor: CARD_BG, borderRadius: CARD_RADIUS, borderWidth: 1, borderColor: '#f0f0f0', padding: 18, marginTop: 18, marginBottom: 40 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 8 }}>Preview</Text>
          <View style={{ backgroundColor: '#f4f5f7', borderRadius: 10, minHeight: 60, marginBottom: 4 }} />
        </View>
      </ScrollView>
      {/* Modal for Edit/Delete */}
      <Modal visible={modal.visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 24, width: '85%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Edit {modal.type === 'term' ? 'Term' : 'Website'}</Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={{ backgroundColor: '#f4f5f7', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 18 }}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={deleteItem} style={{ backgroundColor: '#ffd6d6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
                <Text style={{ color: '#d00', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModal({ visible: false, type: '', idx: null })} style={{ backgroundColor: '#e0e0e0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
                <Text style={{ color: '#444', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={{ backgroundColor: ACCENT, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 