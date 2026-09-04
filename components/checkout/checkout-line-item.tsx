import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Check } from 'lucide-react-native';
import type { FC } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCheckout } from './config';
import type { CheckoutItems } from './type';

interface CheckoutLineItemProps
{
    selectedIds: string[];
    onSelect: (id: string, checked: boolean) => Promise<void>;
}

const CheckoutLineItem: FC<CheckoutLineItemProps> = ({ selectedIds, onSelect }) =>
{
    const { items } = useCheckout();
    const appTheme = useThemedStyles();
    const { colors, shadows } = appTheme;

    const handlePress = async (item: CheckoutItems) =>
    {
        const isChecked = !selectedIds.includes(item.id);
        await onSelect(item.id, isChecked);
    };

    return (
        <View style={styles.listContent}>
            {items.map((item, index) =>
            {
                const isSelected = selectedIds.includes(item.id);
                const totalPrice = item.productPrice + item.otherSpecificationPrice;

                return (
                    <Pressable
                        key={item.id}
                        onPress={() => handlePress(item)}
                        style={({ pressed }) => [
                            styles.row,
                            {
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? colors.secondary : colors.background,
                                opacity: pressed ? 0.85 : 1,
                                marginTop: index === 0 ? 0 : spacing * 2.5,
                            },
                            isSelected && shadows.xs,
                        ]}
                    >
                        <View
                            style={[
                                styles.checkCircle,
                                {
                                    borderColor: isSelected ? colors.primary : colors.border,
                                    backgroundColor: isSelected ? colors.primary : 'transparent',
                                },
                            ]}
                        >
                            {isSelected && <Check size={13} color={colors.primaryForeground} strokeWidth={3} />}
                        </View>

                        <Image
                            source={{ uri: item.productImage }}
                            style={[styles.thumbnail, { backgroundColor: colors.muted }]}
                            resizeMode="cover"
                        />

                        <View style={styles.details}>
                            <Text
                                style={[
                                    styles.productName,
                                    { color: isSelected ? colors.primary : colors.cardForeground },
                                ]}
                                numberOfLines={1}
                            >
                                {item.product}
                            </Text>
                            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                                {item.quantity} × {item.noOfUnits} units
                            </Text>
                        </View>

                        <Text
                            style={[
                                styles.price,
                                { color: isSelected ? colors.primary : colors.cardForeground },
                            ]}
                        >
                            Rs {totalPrice.toFixed(0)}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    listContent: {
        gap: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing * 3,
        borderWidth: 1.5,
        borderRadius: radius.lg,
        minHeight: 88,
        paddingVertical: spacing * 3.5,
        paddingHorizontal: spacing * 3.5,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: radius.xl,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnail: {
        width: 48,
        height: 62,
        borderRadius: radius.sm,
    },
    details: {
        flex: 1,
        gap: spacing,
    },
    productName: {
        fontSize: 14,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
    meta: {
        fontSize: 12,
        fontFamily: fonts.sans,
        letterSpacing,
    },
    price: {
        fontSize: 14,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
});

export default CheckoutLineItem;