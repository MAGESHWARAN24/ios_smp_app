import { useThemedStyles } from '@/lib/useThemedStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderCompleteProps { }

const OrderComplete: FC<OrderCompleteProps> = () =>
{
    const { orderNumber = "", referenceNo = "" } = useLocalSearchParams<{ orderNumber: string, referenceNo: string }>()
    const appTheme = useThemedStyles()
    const { colors, shadows } = appTheme
    const router = useRouter()

    const handleContinueShopping = () =>
    {
        router.replace('/(tabs)/products')
    }

    const handleViewOrder = () =>
    {
        router.push({
            pathname: '/order/[orderNumber]',
            params: { orderNumber },
        })
    }

    return (
        <SafeAreaView style={[appTheme.styles.screen, styles.container]}>
            <View style={styles.content}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                    <Check size={56} color={colors.primaryForeground} strokeWidth={3} />
                </View>

                <Text style={[styles.title, { color: colors.foreground }]}>
                    Order Placed Successfully!
                </Text>
                <Text style={[styles.subtitle, { color: colors.bodyText }]}>
                    Thank you for your order. We've received your payment and will start processing it right away.
                </Text>
            </View>

            <View style={styles.buttonGroup}>
                <Pressable
                    style={({ pressed }) => [
                        appTheme.styles.primaryButton,
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleViewOrder}
                >
                    <Text style={appTheme.styles.primaryButtonText}>View Order {referenceNo}</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        appTheme.styles.button,
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleContinueShopping}
                >
                    <Text style={appTheme.styles.buttonText}>Continue Shopping</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

export default OrderComplete;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'AvenirNext-Regular',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    detailsCard: {
        width: '100%',
        borderRadius: 16, // radius.lg
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    detailLabel: {
        fontFamily: 'AvenirNext-Regular',
        fontSize: 13,
    },
    detailValue: {
        fontFamily: 'AvenirNext-DemiBold',
        fontSize: 13,
        maxWidth: '60%',
        textAlign: 'right',
    },
    divider: {
        height: 1,
    },
    buttonGroup: {
        width: '100%',
        gap: 12,
    },
    button: {
        height: 52,
    },
    buttonPressed: {
        opacity: 0.85,
    },
});