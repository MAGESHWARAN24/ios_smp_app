import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AddressItem
{
    id: string;
    addressTypeId: { label: string; value: string };
    addressReferenceName: string;
    contactPersonName: string;
    mobileNo: string;
    address: string;
}

interface AddressCardProps
{
    item: AddressItem;
    selected: boolean;
    onSelect: (id: string) => void;
}

const AddressCard: FC<AddressCardProps> = ({ item, selected, onSelect }) =>
{
    const appTheme = useThemedStyles();
    const { colors, styles: themedStyles, shadows } = appTheme;

    return (
        <Pressable
            onPress={() => onSelect(item.id)}
            style={[
                themedStyles.card,
                styles.card,
                selected && {
                    borderColor: colors.primary,
                    backgroundColor: colors.secondary,
                    ...shadows.sm,
                },
            ]}
        >
            <View style={styles.headerRow}>
                <View style={styles.titleRow}>
                    <Text style={[themedStyles.title, styles.refName]} numberOfLines={1}>
                        {item.addressReferenceName || 'Address'}
                    </Text>
                </View>

                <View
                    style={[
                        styles.radioOuter,
                        { borderColor: selected ? colors.primary : colors.border },
                    ]}
                >
                    {selected && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                </View>
            </View>
            <Text style={[themedStyles.text, styles.contactName]}>
                {item.contactPersonName}
            </Text>

            <Text style={[themedStyles.mutedText, styles.addressText]}>
                {item.address}
            </Text>

            <Text style={themedStyles.text}>{item.mobileNo}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: spacing,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        gap: spacing * 2,
    },
    refName: {
        fontSize: 15,
        flexShrink: 1,
    },
    badge: {
        padding: 0,
        paddingHorizontal: spacing * 2,
        paddingVertical: spacing * 0.5,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: fonts.sansSemiBold,
        letterSpacing,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: radius.xl,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: radius.md,
    },
    typeLabel: {
        marginBottom: spacing * 1.5,
    },
    contactName: {
        fontFamily: fonts.sansMedium,
        marginBottom: spacing * 0.5,
    },
    addressText: {
        lineHeight: 18,
        marginBottom: spacing,
    },
});

export default AddressCard;