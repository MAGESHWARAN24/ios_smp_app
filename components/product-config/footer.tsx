import { useThemedStyles } from '@/lib/useThemedStyles';
import { useRouter } from 'expo-router';
import { useMemo, type FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ItemPrice } from './type';

interface FooterProps
{
    productId: string
    item: ItemPrice
}

const Footer: FC<FooterProps> = ({ item, productId }) =>
{
    const appTheme = useThemedStyles()
    const router = useRouter()
    const inset = useSafeAreaInsets()
    const styles = useMemo(() => StyleSheet.create({
        footer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: appTheme.colors.border,
            backgroundColor: appTheme.colors.card,
            height: 60 + inset.bottom
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
        }
    }), [appTheme.colors, inset.bottom])

    return (
        <>
            <View style={styles.footer}>
                {item.isValid ? (
                    <View style={styles.footerLeft}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>Rs {item.price.toFixed(2)}</Text>
                    </View>
                ) : (<View></View>)}
                <Pressable
                    disabled={!item.isValid}
                    style={[
                        item.isValid
                            ? appTheme.styles.primaryButton
                            : appTheme.styles.disabledButton
                    ]}
                    onPress={() =>
                    {
                        if (item.isValid)
                        {
                            router.navigate(`products/${productId}/${item.id}`)
                        }
                    }}
                >
                    <Text
                        style={[
                            item.isValid
                                ? appTheme.styles.primaryButtonText
                                : appTheme.styles.disabledButtonText
                        ]}
                    >
                        Upload Design
                    </Text>
                </Pressable>
            </View>
        </>
    );
}

export default Footer;
