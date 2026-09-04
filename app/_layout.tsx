import AuthProvider from "@/components/auth/provider";
import CartProvider from "@/components/cart/provider";
import NetworkProvider from "@/components/network/provider";
import { Stack } from "expo-router";
import type { FC } from 'react';
import Toast from "react-native-toast-message";

interface RootLayoutProps { }

const RootLayout: FC<RootLayoutProps> = () =>
{
    return (
        <NetworkProvider>
            <AuthProvider>
                <CartProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    />
                    <Toast />
                </CartProvider>
            </AuthProvider>
        </NetworkProvider>
    );
}

export default RootLayout;