import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      id: 1,
      icon: "document-text",
      title: "Upload Resume",
      description: "Upload your resume for detailed analysis",
      color: "#3B82F6",
    },
    {
      id: 2,
      icon: "analytics",
      title: "AI Analysis",
      description: "Get AI-powered insights and recommendations",
      color: "#8B5CF6",
    },
    {
      id: 3,
      icon: "star",
      title: "ATS Score",
      description: "Check your resume's ATS compatibility",
      color: "#F59E0B",
    },
    {
      id: 4,
      icon: "checkmark-circle",
      title: "Improvements",
      description: "Receive personalized suggestions",
      color: "#10B981",
    },
  ];

  const recentAnalyses = [
    {
      id: 1,
      fileName: "John_Doe_Resume.pdf",
      score: 85,
      date: "2 days ago",
    },
    {
      id: 2,
      fileName: "Resume_Updated.pdf",
      score: 78,
      date: "5 days ago",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back! 👋</Text>
            <Text style={styles.subGreeting}>
              Let&apos;s analyze your resume today
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#0A1D4D" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.uploadCard}
          onPress={() => router.push("/analyze")}
        >
          <View style={styles.uploadIconContainer}>
            <Ionicons name="cloud-upload-outline" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.uploadTextContainer}>
            <Text style={styles.uploadTitle}>Upload New Resume</Text>
            <Text style={styles.uploadSubtitle}>
              Tap to upload and analyze your resume
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: feature.color },
                  ]}
                >
                  <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Analysis</Text>
            <TouchableOpacity onPress={() => router.push("/history")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentAnalyses.length > 0 ? (
            recentAnalyses.map((analysis) => (
              <TouchableOpacity key={analysis.id} style={styles.analysisCard}>
                <View style={styles.analysisIcon}>
                  <Ionicons name="document-text" size={24} color="#0A1D4D" />
                </View>
                <View style={styles.analysisInfo}>
                  <Text style={styles.analysisFileName}>
                    {analysis.fileName}
                  </Text>
                  <Text style={styles.analysisDate}>{analysis.date}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{analysis.score}</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No analyses yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Upload your first resume to get started
              </Text>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: "#6B7280",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A1D4D",
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
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
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  analysisCard: {
    flexDirection: "row",
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
  analysisIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisFileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  analysisDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
