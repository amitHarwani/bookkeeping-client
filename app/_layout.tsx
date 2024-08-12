import { AppRoutes } from "@/constants/routes";
import {
    Inter_100Thin,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect } from "react";
import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import en from "@/lang/en";

// Prevent Splash Screen Auto Hide
SplashScreen.preventAutoHideAsync();

const translations = { en: en }; /* Translation files */

export const i18n = new I18n(translations); /* Initializing i18n */

i18n.locale = getLocales()[0]?.languageCode ?? "en"; /* Selected Language, Defaults to en */

i18n.enableFallback = true; /* Enabling fallback to other languages incase a key is missing */

const RootLayout = () => {
    /* Loading Inter Fonts */
    const [fontsLoaded, errorLoadingFonts] = useFonts({
        Inter_100Thin,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black,
    });

    useEffect(() => {
        /* Once fonts are loaded hide the splace screen */
        if (fontsLoaded || errorLoadingFonts) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, errorLoadingFonts]);

    /* Return null unless, font loading is not complete */
    if (!fontsLoaded && !errorLoadingFonts) {
        return null;
    }

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
        </Stack>
    );
};

export default RootLayout;
