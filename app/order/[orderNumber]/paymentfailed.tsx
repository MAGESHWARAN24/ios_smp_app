import { useThemedStyles } from '@/lib/useThemedStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderPaymentFailedProps { }

const OrderPaymentFailed: FC<OrderPaymentFailedProps> = () =>
{
    const { orderNumber = "" } = useLocalSearchParams<{ orderNumber: string, referenceNo: string }>()
    const appTheme = useThemedStyles()
    const { colors, shadows } = appTheme
    const router = useRouter()

    const handleTryAgain = () =>
    {
        router.replace({
            pathname: '/order/[orderNumber]',
            params: { orderNumber },
        })
    }

    const handleContinueShopping = () =>
    {
        router.replace('/(tabs)/products')
    }

    return (
        <SafeAreaView style={[appTheme.styles.screen, styles.container]}>
            <View style={styles.content}>
                <View style={[styles.iconCircle, { backgroundColor: colors.destructive }]}>
                    <X size={56} color={colors.destructiveForeground} strokeWidth={3} />
                </View>

                <Text style={[styles.title, { color: colors.foreground }]}>
                    Payment Failed
                </Text>
                <Text style={[styles.subtitle, { color: colors.bodyText }]}>
                    Your payment could not be completed due to a network issue or a delay from your bank's server. No amount has been deducted. Please try again.
                </Text>

                {orderNumber ? (
                    <View
                        style={[
                            styles.detailsCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                borderWidth: 1,
                            },
                            shadows.sm,
                        ]}
                    >
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                                Order Number
                            </Text>
                            <Text
                                style={[styles.detailValue, { color: colors.cardForeground }]}
                                numberOfLines={1}
                            >
                                {orderNumber}
                            </Text>
                        </View>
                    </View>
                ) : null}
            </View>

            <View style={styles.buttonGroup}>
                <Pressable
                    style={({ pressed }) => [
                        appTheme.styles.primaryButton,
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handleTryAgain}
                >
                    <Text style={appTheme.styles.primaryButtonText}>Try Again</Text>
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

export default OrderPaymentFailed;

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
        paddingVertical: 4,
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