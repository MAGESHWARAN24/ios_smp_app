import { Stack } from 'expo-router';
import type { FC } from 'react';

interface LayoutProps { }

const Layout: FC<LayoutProps> = () =>
{
    return (
        <Stack
            screenOptions={{
                headerTitle: ''
            }}
        />
    );
}

export default Layout;
