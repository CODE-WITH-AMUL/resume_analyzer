import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: DocumentPicker.DocumentPickerAsset) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePress = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick a document.');
      console.error('Error picking document:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <motion.div
          style={styles.uploadButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>
            {selectedFile ? selectedFile.name : 'Select Resume (PDF)'}
          </Text>
        </motion.div>
      </TouchableOpacity>
      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{selectedFile.name}</Text>
          <Text style={styles.fileSize}>
            {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(2)} KB` : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  fileSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default FileUpload;
