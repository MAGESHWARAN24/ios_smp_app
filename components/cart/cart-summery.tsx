import { useThemedStyles } from '@/lib/useThemedStyles';
import { useRouter } from 'expo-router';
import { useMemo, type FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCart } from './config';

interface CartSummaryProps { }

const CartSummary: FC<CartSummaryProps> = () =>
{
    const { cart } = useCart()
    const appTheme = useThemedStyles()
    const router = useRouter()
    const styles = useMemo(() => StyleSheet.create({
        footer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: appTheme.colors.border,
            backgroundColor: appTheme.colors.card
        },
        footerLeft: {
            gap: 2,
        },
        totalLabel: {
            fontSize: 12,
            color: appTheme.colors.mutedForeground,
        },
        totalValue: {
            fontSize: 20,
            fontWeight: "700",
            color: appTheme.colors.cardForeground,
        },
    }), [appTheme.colors])

    if (cart.totalItems <= 0)
    {
        return null
    }

    return (
        <View key={cart.totalAmount} style={styles.footer}>
            <View style={styles.footerLeft}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>Rs {cart.totalAmount.toFixed(2)}</Text>
            </View>
            <Pressable
                style={[cart.totalItems > 0 ? appTheme.styles.primaryButton : appTheme.styles.disabledButton]}
                onPress={() => router.navigate('checkout/address')}
                disabled={cart.totalItems <= 0}
            >
                <Text style={[cart.totalItems > 0 ? appTheme.styles.primaryButtonText : appTheme.styles.disabledButtonText]}>Checkout</Text>
            </Pressable>
        </View>
    );
}

export default CartSummary;
