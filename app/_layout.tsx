import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AppProvider } from "@/context/AppContext";
import { getHasSeenOnboarding } from "@/lib/storage";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0A0A" },
        animation: "ios_from_right",
      }}
    >
      {/* Onboarding is shown on first launch only; no back gesture allowed */}
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="verse/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="category/[name]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  /**
   * null = still checking AsyncStorage (splash is still showing)
   * true  = user has seen onboarding before → go straight to tabs
   * false = first launch → show onboarding
   */
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    getHasSeenOnboarding().then((seen) => setHasSeenOnboarding(seen));
  }, []);

  useEffect(() => {
    // Only hide the splash screen once both fonts AND the onboarding flag are ready.
    // This prevents any flash of incorrect content on first launch.
    if ((fontsLoaded || fontError) && hasSeenOnboarding !== null) {
      SplashScreen.hideAsync();

      if (hasSeenOnboarding) {
        // Returning user — skip onboarding entirely
        router.replace("/(tabs)/home");
      } else {
        // First-time user — show onboarding
        router.replace("/onboarding");
      }
    }
  }, [fontsLoaded, fontError, hasSeenOnboarding]);

  // Keep showing nothing (splash stays up) until both checks complete
  if (!fontsLoaded && !fontError) return null;
  if (hasSeenOnboarding === null) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0A0A0A" }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
