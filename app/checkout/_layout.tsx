import CheckoutProvider from "@/components/checkout/provider";
import { Stack } from 'expo-router';
import type { FC } from 'react';
interface LayoutProps { }

const Layout: FC<LayoutProps> = () =>
{
    return (
        <CheckoutProvider>
            <Stack
                screenOptions={{
                    headerTitle: ''
                }}
            />
        </CheckoutProvider>
    );
}

export default Layout;
