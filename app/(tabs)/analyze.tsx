import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyzeScreen() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUpload = () => {
    Alert.alert("Coming Soon", "File upload functionality will be added soon!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analyze Resume</Text>
          <Text style={styles.headerSubtitle}>
            Upload your resume for AI-powered analysis
          </Text>
        </View>

        <TouchableOpacity style={styles.uploadBox} onPress={handleUpload}>
          <View style={styles.uploadIconContainer}>
            <Ionicons name="cloud-upload-outline" size={64} color="#0A1D4D" />
          </View>
          <Text style={styles.uploadTitle}>Tap to Upload Resume</Text>
          <Text style={styles.uploadSubtitle}>
            Supported formats: PDF, DOC, DOCX
          </Text>
          <View style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Browse Files</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Better Results</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Use a clean, well-formatted resume</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Include relevant keywords</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Keep file size under 10MB</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  uploadBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: 32,
  },
  uploadIconContainer: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: "#0A1D4D",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  tipsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 12,
  },
});
