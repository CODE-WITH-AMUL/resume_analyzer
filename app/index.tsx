import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Easing,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function GetStartedPage() {
  const router = useRouter();
  const logoTranslateY = useRef(new Animated.Value(-30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1D4D" />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          <View style={styles.centerContent}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoOpacity,
                  transform: [{ translateY: logoTranslateY }],
                },
              ]}
            >
              <Image
                source={require("../assets/resuma/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: textOpacity,
                  transform: [{ translateY: textTranslateY }],
                },
              ]}
            >
              <Text style={styles.title}>Resume Analyzer</Text>
              <Text style={styles.description}>
                Analyze your resume with AI-powered insights and get personalized recommendations
              </Text>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonOpacity,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.9}
              onPress={() => router.push("/auth")}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
            
            <Text style={styles.subText}>Transform your career today</Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1D4D",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 160,
    height: 160,
  },
  textContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: "#D1D5DB",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A1D4D",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
