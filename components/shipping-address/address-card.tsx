import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Pencil, Trash2 } from 'lucide-react-native';
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
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const AddressCard: FC<AddressCardProps> = ({ item, onEdit, onDelete }) =>
{
    const appTheme = useThemedStyles();
    const { colors, styles: themedStyles } = appTheme;

    return (
        <View style={[themedStyles.card, styles.card]}>
            <View style={styles.headerRow}>
                <View style={styles.titleRow}>
                    <Text style={[themedStyles.title, styles.refName]} numberOfLines={1}>
                        {item.addressReferenceName || 'Address'}
                    </Text>
                </View>

                <View style={styles.actionsRow}>
                    <Pressable
                        onPress={() => onEdit(item.id)}
                        hitSlop={8}
                        style={[styles.actionButton, { backgroundColor: colors.muted }]}
                    >
                        <Pencil size={14} color={colors.foreground} />
                    </Pressable>
                    <Pressable
                        onPress={() => onDelete(item.id)}
                        hitSlop={8}
                        style={[styles.actionButton, { backgroundColor: colors.destructive + '15' }]}
                    >
                        <Trash2 size={14} color={colors.destructive} />
                    </Pressable>
                </View>
            </View>

            <Text style={[themedStyles.text, styles.contactName]}>
                {item.contactPersonName}
            </Text>

            <Text style={[themedStyles.mutedText, styles.addressText]}>
                {item.address}
            </Text>

            <Text style={themedStyles.text}>{item.mobileNo}</Text>
        </View>
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
    actionsRow: {
        flexDirection: 'row',
        gap: spacing * 1.5,
    },
    actionButton: {
        height: 30,
        width: 30,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
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