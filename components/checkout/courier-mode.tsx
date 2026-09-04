import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { PriceOptionItem } from '@/types';
import type { Dispatch, FC, SetStateAction } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CourierModeProps
{
    options: PriceOptionItem[];
    selectedValue: string;
    onSelect: Dispatch<SetStateAction<string>>;
    disabled: boolean
}

const CourierMode: FC<CourierModeProps> = ({ options, selectedValue, onSelect, disabled = false }) =>
{
    const appTheme = useThemedStyles();
    const { colors, shadows, styles: themedStyles } = appTheme;

    if (options.length === 0)
    {
        return (
            <View style={styles.emptyContainer}>
                <Text style={themedStyles.mutedText}>No courier options available for this address</Text>
            </View>
        );
    }

    return (
        <View style={styles.optionContainer}>
            {options.map((option) =>
            {
                const isSelected = option.value === selectedValue;

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onSelect(option.value)}
                        style={({ pressed }) => [
                            styles.card,
                            {
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? colors.secondary : colors.background,
                                opacity: pressed || disabled ? 0.85 : 1,
                            },
                            isSelected && shadows.xs,
                        ]}
                        disabled={disabled}
                    >
                        <View style={styles.left}>
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

                            <View style={styles.labelBlock}>
                                <Text
                                    style={[
                                        styles.label,
                                        { color: isSelected ? colors.primary : colors.cardForeground },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {option.label}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={[
                                styles.price,
                                { color: isSelected ? colors.primary : colors.cardForeground },
                            ]}
                        >
                            {option.price > 0 ? `Rs ${option.price.toFixed(2)}` : 0}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    optionContainer: {
        gap: spacing * 2.5,
    },
    emptyContainer: {
        paddingVertical: spacing * 5,
        alignItems: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderRadius: radius.lg,
        paddingVertical: spacing * 3.5,
        paddingHorizontal: spacing * 4,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing * 3,
        flexShrink: 1,
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
    labelBlock: {
        flexShrink: 1,
        gap: spacing * 0.5,
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.sansMedium,
        letterSpacing,
    },
    price: {
        fontSize: 14,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
});

export default CourierMode;