import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { resumeAPI } from '../services/api';

export default function HistoryScreen() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await resumeAPI.getHistory();
      if (history && Array.isArray(history)) {
        setAnalyses(history);
      }
    } catch (error: any) {
      console.error('Error loading history:', error);
      // If not authenticated, show empty state
      if (error.response?.status === 401) {
        setAnalyses([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const getFileName = (cvPath: string) => {
    if (!cvPath) return 'Resume';
    const parts = cvPath.split('/');
    return parts[parts.length - 1] || 'Resume';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A1D4D" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <Text style={styles.headerSubtitle}>
          {analyses.length > 0 
            ? `View all your ${analyses.length} resume analyses`
            : 'No analyses yet. Upload a resume to get started!'
          }
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {analyses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Analyses Yet</Text>
            <Text style={styles.emptySubtitle}>
              Upload your first resume to get AI-powered analysis
            </Text>
          </View>
        ) : (
          analyses.map((analysis) => (
            <TouchableOpacity key={analysis.id} style={styles.historyCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text" size={24} color="#0A1D4D" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {getFileName(analysis.uploaded_cv)}
                  </Text>
                  <Text style={styles.date}>
                    {formatDate(analysis.created_at)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                {analysis.overall_score !== null && analysis.overall_score !== undefined && (
                  <View style={[
                    styles.scoreContainer, 
                    { backgroundColor: getScoreColor(analysis.overall_score) }
                  ]}>
                    <Text style={styles.scoreText}>{analysis.overall_score}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A1D4D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
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
    marginRight: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 42,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
