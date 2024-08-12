import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const AuthLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
            </Stack>
        </QueryClientProvider>
    );
};

export default AuthLayout;
