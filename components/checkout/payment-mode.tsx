import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { useMemo, useState, type FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { paymentOptions, useCheckout } from './config';
import { PaymentOption } from './type';
interface PaymentModeProps
{
    value?: string;
    onSelect?: (value: string) => void;
    disabled?: boolean
}

const PaymentMode: FC<PaymentModeProps> = ({ value, onSelect, disabled = false }) =>
{
    const appTheme = useThemedStyles();
    const { colors, shadows } = appTheme;
    const { summary } = useCheckout();

    const canUseWallet = summary.totalWalletAmount >= (summary.totalAmount + summary.totalShippingAmount);
    const options = useMemo(() => paymentOptions(summary, canUseWallet), [summary, canUseWallet]);

    // Falls back to internal state if the parent doesn't control selection
    const [internalValue, setInternalValue] = useState<string>('');
    const selectedValue = value ?? internalValue;

    const handleSelect = (option: PaymentOption) =>
    {
        if (option.disabled) return;
        onSelect ? onSelect(option.value) : setInternalValue(option.value);
    };

    return (
        <View style={styles.container}>
            {options.map((option) =>
            {
                const isSelected = option.value === selectedValue;
                const Icon = option.icon;

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => handleSelect(option)}
                        disabled={option.disabled || disabled}
                        style={({ pressed }) => [
                            styles.card,
                            {
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? colors.secondary : colors.background,
                                opacity: option.disabled || disabled ? 0.5 : pressed ? 0.85 : 1,
                            },
                            isSelected && !option.disabled && shadows.xs,
                        ]}
                    >
                        <View
                            style={[
                                styles.iconWrap,
                                { backgroundColor: isSelected ? colors.primary : colors.muted },
                            ]}
                        >
                            <Icon
                                size={18}
                                color={isSelected ? colors.primaryForeground : colors.mutedForeground}
                                strokeWidth={2}
                            />
                        </View>

                        <View style={styles.body}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.label, { color: colors.cardForeground }]}>
                                    {option.label}
                                </Text>
                                {option.badge && (
                                    <View
                                        style={[
                                            styles.badge,
                                            {
                                                backgroundColor:
                                                    option.badge.variant === 'default'
                                                        ? colors.primaryForeground
                                                        : colors.muted,
                                                borderColor:
                                                    option.badge.variant === 'default'
                                                        ? colors.primary
                                                        : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.badgeText,
                                                {
                                                    color:
                                                        option.badge.variant === 'default'
                                                            ? colors.primary
                                                            : colors.mutedForeground,
                                                },
                                            ]}
                                        >
                                            {option.badge.text}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
                                {option.description}
                            </Text>

                            {option.additionalText ? (
                                <Text style={[styles.additionalText, { color: colors.mutedForeground }]}>
                                    {option.additionalText}: Rs {option.balance.toFixed(2)}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.right}>
                            <Text style={[styles.amount, { color: colors.cardForeground }]}>
                                Rs {option.amount.toFixed(2)}
                            </Text>
                            <View
                                style={[
                                    styles.radioOuter,
                                    { borderColor: isSelected ? colors.primary : colors.border },
                                ]}
                            >
                                {isSelected && (
                                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                                )}
                            </View>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing * 2.5,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1.5,
        borderRadius: radius.lg,
        padding: spacing * 3.5,
        gap: spacing * 3,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        flex: 1,
        gap: spacing * 0.75,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing * 2,
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
    badge: {
        borderWidth: 1,
        borderRadius: radius.sm,
        paddingHorizontal: spacing * 2,
        paddingVertical: spacing * 0.5,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
    description: {
        fontSize: 12,
        fontFamily: fonts.sans,
        letterSpacing,
        lineHeight: 16,
    },
    additionalText: {
        fontSize: 11,
        fontFamily: fonts.sansMedium,
        letterSpacing,
        marginTop: spacing * 0.5,
    },
    right: {
        alignItems: 'flex-end',
        gap: spacing * 2,
    },
    amount: {
        fontSize: 13,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: radius.xl,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 9,
        height: 9,
        borderRadius: radius.md,
    },
});

export default PaymentMode;