import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const AuthLayout = () => {
    return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
            </Stack>
    );
};

export default AuthLayout;
