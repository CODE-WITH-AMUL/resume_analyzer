import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkColors : lightColors;

  const features = [
    {
      id: 1,
      icon: "document-text",
      title: "Upload Resume",
      description: "Upload your resume for detailed analysis",
      color: "#3B82F6",
      lightColor: isDarkMode ? "rgba(59, 130, 246, 0.15)" : "#DBEAFE",
    },
    {
      id: 2,
      icon: "analytics",
      title: "AI Analysis",
      description: "Get AI-powered insights and recommendations",
      color: "#8B5CF6",
      lightColor: isDarkMode ? "rgba(139, 92, 246, 0.15)" : "#EDE9FE",
    },
    {
      id: 3,
      icon: "star",
      title: "ATS Score",
      description: "Check your resume's ATS compatibility",
      color: "#F59E0B",
      lightColor: isDarkMode ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
    },
    {
      id: 4,
      icon: "checkmark-circle",
      title: "Improvements",
      description: "Receive personalized suggestions",
      color: "#10B981",
      lightColor: isDarkMode ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
    },
  ];

  const recentAnalyses = [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.text }]}>Welcome Back! 👋</Text>
            <Text style={[styles.subGreeting, { color: theme.subText }]}>
              Let's analyze your resume today
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.themeButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setIsDarkMode(!isDarkMode)}
            >
              <Ionicons 
                name={isDarkMode ? "sunny" : "moon"} 
                size={20} 
                color={isDarkMode ? "#F59E0B" : "#3B82F6"} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.notificationButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.notificationBadge} />
              <Ionicons name="notifications-outline" size={22} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section - What is this app */}
        <View style={[styles.heroSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.heroIconGradient}
            >
              <Ionicons name="briefcase" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            AI-Powered Resume Analyzer
          </Text>
          <Text style={[styles.heroDescription, { color: theme.subText }]}>
            Get instant feedback on your resume with our advanced AI technology. 
            Improve your chances of landing your dream job with ATS optimization 
            and personalized recommendations.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Accuracy</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Resumes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.9★</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Upload Card with Gradient */}
        <TouchableOpacity
          style={styles.uploadCardWrapper}
          onPress={() => router.push("/analyze")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1E40AF', '#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.uploadCard}
          >
            <View style={styles.uploadContent}>
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadTitle}>Upload New Resume</Text>
                <Text style={styles.uploadSubtitle}>
                  PDF, DOC, DOCX • Max 5MB
                </Text>
              </View>
              <View style={styles.chevronContainer}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Features Section - Horizontal Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Features</Text>
            <View style={styles.titleUnderline} />
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresScroll}
          >
            {features.map((feature, index) => (
              <TouchableOpacity 
                key={feature.id} 
                style={[
                  styles.featureCard, 
                  { backgroundColor: theme.card, borderColor: theme.border },
                  index === 0 && styles.featureCardFirst,
                  index === features.length - 1 && styles.featureCardLast,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: feature.lightColor },
                  ]}
                >
                  <Ionicons name={feature.icon as any} size={28} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: theme.subText }]}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Analysis Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Analysis</Text>
              <View style={styles.titleUnderline} />
            </View>
            <TouchableOpacity 
              onPress={() => router.push("/history")}
              style={[styles.viewAllButton, { backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }]}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: isDarkMode ? "rgba(59, 130, 246, 0.1)" : "#F8FAFC" }]}>
              <Ionicons name="document-outline" size={48} color={theme.subText} />
            </View>
            <Text style={[styles.emptyStateText, { color: theme.text }]}>No analyses yet</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.subText }]}>
              Upload your first resume to get started
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const lightColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  subText: "#64748B",
  border: "#E2E8F0",
  icon: "#1E3A8A",
};

const darkColors = {
  background: "#0F172A",
  card: "#1E293B",
  text: "#F1F5F9",
  subText: "#94A3B8",
  border: "#334155",
  icon: "#60A5FA",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 15,
    fontWeight: "400",
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  heroIconContainer: {
    marginBottom: 16,
  },
  heroIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  heroDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3B82F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  uploadCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  uploadCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  uploadContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "400",
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  titleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: "#3B82F6",
    borderRadius: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
  },
  featuresScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    width: 200,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  featureCardFirst: {
    marginLeft: 0,
  },
  featureCardLast: {
    marginRight: 0,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },
  analysisContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  analysisCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#1E40AF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  analysisLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  analysisIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  analysisInfo: {
    flex: 1,
  },
  analysisFileName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  analysisDate: {
    fontSize: 13,
    fontWeight: "400",
  },
  scoreContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 65,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "400",
  },
  bottomSpacing: {
    height: 24,
  },
});