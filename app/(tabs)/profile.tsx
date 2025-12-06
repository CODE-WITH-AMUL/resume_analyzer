import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  const menuItems = [
    {
      id: 1,
      icon: "person-outline",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      onPress: () => Alert.alert("Coming Soon", "Feature in development"),
    },
    {
      id: 2,
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      onPress: () => Alert.alert("Coming Soon", "Feature in development"),
    },
    {
      id: 3,
      icon: "lock-closed-outline",
      title: "Privacy & Security",
      subtitle: "Control your privacy settings",
      onPress: () => Alert.alert("Coming Soon", "Feature in development"),
    },
    {
      id: 4,
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      onPress: () => Alert.alert("Coming Soon", "Feature in development"),
    },
    {
      id: 5,
      icon: "information-circle-outline",
      title: "About",
      subtitle: "App version and information",
      onPress: () => Alert.alert("About", "Resume Analyzer v1.0.0"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Ionicons name="person" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Analyses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>85</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#0A1D4D" />
                </View>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0A1D4D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  menuItem: {
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
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A1D4D",
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
