import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { resumeAPI } from '../services/api';
import { useRouter } from 'expo-router';

export default function AnalyzeScreen() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }

      setUploadedFile(file);
      setUploading(true);
      setUploadProgress(0);

      // Prepare file object for upload
      const fileObj = {
        uri: file.uri,
        type: file.mimeType || 'application/pdf',
        name: file.name,
      };

      // Upload and analyze
      const response = await resumeAPI.uploadAndAnalyze(fileObj, (progress: number) => {
        setUploadProgress(progress);
      });

      setUploading(false);
      Alert.alert(
        'Success!',
        `Resume analyzed successfully!\nOverall Score: ${response.overall_score}/100`,
        [
          {
            text: 'View Details',
            onPress: () => {
              // Navigate to history or results screen
              router.push('/(tabs)/history');
            }
          },
          { text: 'OK' }
        ]
      );
      
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploading(false);
      Alert.alert('Upload Failed', error.response?.data?.error || error.message || 'Failed to upload resume');
    }
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

        <TouchableOpacity 
          style={styles.uploadBox} 
          onPress={handleUpload}
          disabled={uploading}
        >
          <View style={styles.uploadIconContainer}>
            {uploading ? (
              <ActivityIndicator size="large" color="#0A1D4D" />
            ) : (
              <Ionicons name="cloud-upload-outline" size={64} color="#0A1D4D" />
            )}
          </View>
          
          {uploading ? (
            <>
              <Text style={styles.uploadTitle}>Uploading...</Text>
              <Text style={styles.uploadSubtitle}>
                {uploadProgress}% complete
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
            </>
          ) : uploadedFile ? (
            <>
              <Text style={styles.uploadTitle}>{uploadedFile.name}</Text>
              <Text style={styles.uploadSubtitle}>
                Tap to upload a different file
              </Text>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Change File</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.uploadTitle}>Tap to Upload Resume</Text>
              <Text style={styles.uploadSubtitle}>
                Supported formats: PDF, DOC, DOCX, TXT
              </Text>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Browse Files</Text>
              </View>
            </>
          )}
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
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Ensure text is selectable (not scanned image)</Text>
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
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: 'center',
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
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0A1D4D',
    borderRadius: 4,
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
    flex: 1,
  },
});
