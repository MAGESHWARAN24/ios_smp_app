import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { IconOptionItem } from '@/types';
import type { Dispatch, FC, SetStateAction } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TransportModeItemProps
{
    isSelected: boolean;
    item: IconOptionItem;
    onSelect: Dispatch<SetStateAction<string>>;
}

const TransportModeItem: FC<TransportModeItemProps> = ({
    isSelected = false,
    item,
    onSelect,
}) =>
{
    const appTheme = useThemedStyles();
    const { colors, shadows } = appTheme;
    const Icon = item.icon;

    return (
        <Pressable
            onPress={() => onSelect(item.value)}
            style={({ pressed }) => [
                styles.card,
                {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.secondary : colors.card,
                    opacity: pressed ? 0.85 : 1,
                },
                isSelected && shadows.sm,
            ]}
        >
            <View
                style={[
                    styles.iconWrap,
                    {
                        backgroundColor: isSelected ? colors.primary : colors.muted,
                    },
                ]}
            >
                <Icon
                    size={22}
                    color={isSelected ? colors.primaryForeground : colors.mutedForeground}
                    strokeWidth={2}
                />
            </View>

            <Text
                style={[
                    styles.label,
                    { color: isSelected ? colors.primary : colors.mutedForeground },
                ]}
                numberOfLines={2}
            >
                {item.label}
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
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderWidth: 1.5,
        borderRadius: radius.lg,
        paddingVertical: spacing * 4,
        paddingHorizontal: spacing * 3,
        alignItems: 'center',
        gap: spacing * 2.5,
        minHeight: 120,
        justifyContent: 'flex-start',
        flexDirection: "row"
    },
    iconWrap: {
        width: 55,
        height: 55,
        borderRadius: radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontFamily: fonts.sansMedium,
        letterSpacing,
        fontWeight: "bold",
        textAlign: 'center',
    },
    radioOuter: {
        position: 'absolute',
        top: spacing * 2,
        right: spacing * 2,
        width: 20,
        height: 20,
        borderRadius: radius.xl,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: radius.md,
    },
});

export default TransportModeItem;