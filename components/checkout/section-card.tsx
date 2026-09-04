import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AlertCircle, type LucideIcon } from 'lucide-react-native';
import type { FC, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionCardProps
{
    title: string;
    icon?: LucideIcon;
    subtitle?: string;
    children: ReactNode;
    error?: string;
}

/**
 * Consistent card wrapper used for every section of the payment screen
 * (Payment Mode, Courier, Items) so the page reads as one coherent flow
 * instead of loosely stacked components. Pass `error` to highlight the
 * section (e.g. after a failed validation attempt) and show an inline
 * message.
 */
const SectionCard: FC<SectionCardProps> = ({ title, icon: Icon, subtitle, children, error }) =>
{
    const { colors, shadows } = useThemedStyles();
    const hasError = !!error;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: hasError ? colors.destructive : colors.border,
                },
                shadows.xs,
            ]}
        >
            <View style={styles.headerRow}>
                {Icon && (
                    <View
                        style={[
                            styles.iconWrap,
                            { backgroundColor: hasError ? colors.destructive : colors.secondary },
                        ]}
                    >
                        <Icon
                            size={16}
                            color={hasError ? colors.destructiveForeground : colors.primary}
                            strokeWidth={2.25}
                        />
                    </View>
                )}
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.cardForeground }]}>{title}</Text>
                    {subtitle ? (
                        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
                    ) : null}
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {children}

            {hasError && (
                <View style={styles.errorRow}>
                    <AlertCircle size={14} color={colors.destructive} strokeWidth={2.25} />
                    <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: radius.xl,
        padding: spacing * 4,
        gap: spacing * 3.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing * 3,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        gap: spacing * 0.5,
    },
    title: {
        fontSize: 16,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: fonts.sans,
        letterSpacing,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: '100%',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing * 1.5,
    },
    errorText: {
        fontSize: 12,
        fontFamily: fonts.sansMedium,
        letterSpacing,
        flexShrink: 1,
    },
});

export default SectionCard;