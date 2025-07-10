import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { appwriteService } from "../services/appwrite";

const BG = "#0f0f0f";
const CARD_BG = "#1a1a1a";
const ACCENT = "#34d399";
const TEXT = "#ffffff";
const SUBTLE = "#666666";
const SUCCESS = "#34d399";
const ERROR = "#ef4444";
const WARNING = "#f59e0b";

export default function Test() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, {
      message,
      type, // 'info', 'success', 'error', 'warning'
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult("🔄 Starting Appwrite connection test...", 'info');
      const result = await appwriteService.testConnection();
      
      if (result.success) {
        addResult("✅ All tests passed successfully!", 'success');
      } else {
        addResult(`❌ Test failed: ${result.message}`, 'error');
        if (result.error?.step) {
          addResult(`Failed at step: ${result.error.step}`, 'error');
        }
        if (result.error?.details) {
          addResult(`Details: ${result.error.details}`, 'error');
        }
        if (result.hint) {
          addResult(`💡 Hint: ${result.hint}`, 'warning');
        }
      }
    } catch (error) {
      addResult(`❌ Unexpected error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'success': return SUCCESS;
      case 'error': return ERROR;
      case 'warning': return WARNING;
      default: return TEXT;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG, padding: 20 }}>
      <View style={{ alignItems: "center", marginTop: 40, marginBottom: 20 }}>
        <Text style={{ color: TEXT, fontSize: 24, fontWeight: "bold" }}>
          Appwrite Connection Test
        </Text>
        <Text style={{ color: SUBTLE, marginTop: 8, textAlign: "center" }}>
          This will test your Appwrite connection and permissions
        </Text>
      </View>

      <TouchableOpacity
        onPress={runTest}
        disabled={loading}
        style={{
          backgroundColor: ACCENT,
          borderRadius: 8,
          padding: 16,
          alignItems: "center",
          marginBottom: 20,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={BG} />
        ) : (
          <Text style={{ color: BG, fontWeight: "bold", fontSize: 16 }}>
            Run Test
          </Text>
        )}
      </TouchableOpacity>

      <ScrollView
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 12,
          padding: 16,
          flex: 1,
        }}
      >
        {results.map((result, index) => (
          <View
            key={index}
            style={{
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: index < results.length - 1 ? 1 : 0,
              borderBottomColor: "#333",
            }}
          >
            <Text style={{ color: getMessageColor(result.type), marginBottom: 4 }}>
              {result.message}
            </Text>
            <Text style={{ color: SUBTLE, fontSize: 12 }}>
              {result.timestamp}
            </Text>
          </View>
        ))}

        {results.length === 0 && (
          <Text style={{ color: SUBTLE, textAlign: "center" }}>
            Click "Run Test" to start testing your Appwrite connection
          </Text>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
          gap: 4,
        }}
      >
        <Text style={{ color: SUBTLE }}>Ready to proceed?</Text>
        <Link href="/(auth)/login" style={{ color: ACCENT }}>
          Go to Login
        </Link>
      </View>
    </View>
  );
} 