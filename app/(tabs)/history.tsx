import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen() {
  const analyses = [
    {
      id: 1,
      fileName: "John_Doe_Resume.pdf",
      score: 85,
      date: "Dec 4, 2025",
      status: "completed",
    },
    {
      id: 2,
      fileName: "Resume_Updated.pdf",
      score: 78,
      date: "Dec 1, 2025",
      status: "completed",
    },
    {
      id: 3,
      fileName: "Software_Engineer_CV.pdf",
      score: 92,
      date: "Nov 28, 2025",
      status: "completed",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <Text style={styles.headerSubtitle}>
          View all your previous resume analyses
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {analyses.map((analysis) => (
          <TouchableOpacity key={analysis.id} style={styles.historyCard}>
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={24} color="#0A1D4D" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.fileName}>{analysis.fileName}</Text>
                <Text style={styles.date}>{analysis.date}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{analysis.score}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreContainer: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
