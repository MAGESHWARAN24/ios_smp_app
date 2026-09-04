import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { useMemo, type FC } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCheckout } from './config';

interface CheckoutFooterProps
{
    isHasNextPage: boolean;
    nextPageLabel: string;
    onPressHandler: () => void;
    isLoading?: boolean;
}

const CheckoutFooter: FC<CheckoutFooterProps> = ({
    isHasNextPage = false,
    nextPageLabel = 'Next',
    onPressHandler,
    isLoading = false,
}) =>
{
    const appTheme = useThemedStyles();
    const { colors, shadows } = appTheme;
    const insets = useSafeAreaInsets();
    const { summary } = useCheckout();
    const totalAmount = useMemo(() => summary.totalAmount + summary.totalShippingAmount, [summary]);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                },
                footer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: spacing * 4,
                    paddingHorizontal: spacing * 5,
                    paddingTop: spacing * 4,
                    paddingBottom: Math.max(insets.bottom, spacing * 4),
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                    backgroundColor: colors.card,
                    borderTopLeftRadius: radius.xl,
                    borderTopRightRadius: radius.xl,
                    ...shadows.lg,
                },
                summaryBlock: {
                    flexShrink: 1,
                    gap: spacing * 0.5,
                },
                metaRow: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing * 1.5,
                },
                metaText: {
                    fontSize: 11,
                    fontFamily: fonts.sansMedium,
                    color: colors.mutedForeground,
                    letterSpacing,
                },
                metaDot: {
                    width: 3,
                    height: 3,
                    borderRadius: radius.sm,
                    backgroundColor: colors.mutedForeground,
                },
                totalLabel: {
                    fontSize: 11,
                    fontFamily: fonts.sansMedium,
                    color: colors.mutedForeground,
                    letterSpacing,
                    textTransform: 'uppercase',
                },
                totalValue: {
                    fontSize: 22,
                    fontFamily: fonts.sansBold,
                    color: colors.cardForeground,
                    letterSpacing,
                },
                button: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing * 2,
                    paddingHorizontal: spacing * 6,
                    paddingVertical: spacing * 3.75,
                    minWidth: 132,
                    borderRadius: radius.lg,
                },
                buttonPrimary: {
                    backgroundColor: colors.primary,
                },
                buttonDisabled: {
                    backgroundColor: colors.muted,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
                buttonPressed: {
                    opacity: 0.85,
                },
                buttonLabel: {
                    fontSize: 15,
                    fontFamily: fonts.sansSemiBold,
                    letterSpacing,
                },
                buttonLabelPrimary: {
                    color: colors.primaryForeground,
                },
                buttonLabelDisabled: {
                    color: colors.mutedForeground,
                },
            }),
        [colors, shadows, insets.bottom],
    );

    const isDisabled = !isHasNextPage || isLoading;

    return (
        <View style={styles.container}>
            <View style={styles.footer}>
                <View style={styles.summaryBlock}>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                            {summary.totalItemToCheckout} item{summary.totalItemToCheckout === 1 ? '' : 's'}
                        </Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.metaText}>
                            {summary.totalShippingAmount > 0
                                ? `Shipping Rs ${summary.totalShippingAmount.toFixed(2)}`
                                : 'Free shipping'}
                        </Text>
                    </View>

                    <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue} numberOfLines={1}>
                            Rs {totalAmount.toFixed(2)}
                        </Text>
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        isDisabled ? styles.buttonDisabled : styles.buttonPrimary,
                        pressed && !isDisabled && styles.buttonPressed,
                    ]}
                    disabled={isDisabled}
                    onPress={onPressHandler}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.primaryForeground} />
                    ) : (
                        <Text
                            style={[
                                styles.buttonLabel,
                                isDisabled ? styles.buttonLabelDisabled : styles.buttonLabelPrimary,
                            ]}
                            numberOfLines={1}
                        >
                            {nextPageLabel}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
};

export default CheckoutFooter;