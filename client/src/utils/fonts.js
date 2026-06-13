// src/utils/fonts.js
// Centralized font-loading hook for Plus Jakarta Sans.
// Consumed once in App.js — prevents FOUC (Flash of Unstyled Content).

import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

/**
 * Load all Plus Jakarta Sans weights needed by the app.
 * @returns {{ fontsLoaded: boolean }}
 */
export const useAppFonts = () => {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return { fontsLoaded };
};
