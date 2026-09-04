import { useCart } from '@/components/cart/config';
import LeftHeader from '@/components/common/left-header';
import RightHeader from '@/components/common/right-header';
import { radius } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Tabs } from 'expo-router';
import { CircleUser, Home, PackageCheck, Printer, ShoppingCart } from 'lucide-react-native';
import { useMemo, type FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LayoutProps { }

const Layout: FC<LayoutProps> = () =>
{
    const appTheme = useThemedStyles()
    const inset = useSafeAreaInsets()
    const { cart } = useCart()
    const styles = useMemo(() => StyleSheet.create({
        container: {
            position: 'relative',
            height: 50,
            width: 50,
            alignItems: 'center',
            justifyContent: 'center'
        },
        activeIndicator: {
            top: -6,
            position: 'absolute',
            height: 6,
            width: "100%",
            backgroundColor: appTheme.colors.primary,
            borderBottomLeftRadius: radius.xl,
            borderBottomRightRadius: radius.xl
        }
    }), [appTheme])

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: appTheme.colors.primary,
                tabBarInactiveTintColor: appTheme.colors.mutedForeground,
                tabBarStyle: {
                    height: 65 + inset.bottom
                },
                tabBarItemStyle: {
                    paddingVertical: 11
                },
                headerTitle: LeftHeader,
                headerRight: RightHeader
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.container]}>
                            {focused && <View style={[styles.activeIndicator]} />}
                            <Home color={color} size={size} />
                        </View>
                    )
                }}
            />
            <Tabs.Screen
                name='products'
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.container]}>
                            {focused && <View style={[styles.activeIndicator]} />}
                            <Printer color={color} size={size} />
                        </View>
                    )
                }}
            />
            <Tabs.Screen
                name='cart'
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.container]}>
                            {focused && <View style={[styles.activeIndicator]} />}
                            <ShoppingCart color={color} size={size} />
                        </View>
                    ),
                    tabBarBadgeStyle: {
                        backgroundColor: appTheme.colors.primary,
                        color: appTheme.colors.background,
                        top: -10,
                        left: 20
                    },
                    tabBarBadge: cart.totalItems
                }}
            />
            <Tabs.Screen
                name='orders'
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.container]}>
                            {focused && <View style={[styles.activeIndicator]} />}
                            <PackageCheck color={color} size={size} />
                        </View>
                    )
                }}
            />
            <Tabs.Screen
                name='account'
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={[styles.container]}>
                            {focused && <View style={[styles.activeIndicator]} />}
                            <CircleUser color={color} size={size} />
                        </View>
                    )
                }}
            />
        </Tabs>
    );
}

export default Layout;