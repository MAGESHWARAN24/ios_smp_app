import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import AddressCard from './address-card';
import { useAddress } from './config';

interface AddressSelectorProps { }

const AddressSelector: FC<AddressSelectorProps> = () =>
{
    const { items, setAddressId, addressId, loading } = useAddress();
    const appTheme = useThemedStyles();

    if (loading)
    {
        return (
            <View style={[appTheme.styles.screen]}>
                <ActivityIndicator size="large" color={appTheme.colors.primary} />
            </View>
        );
    }

    if (!items || items.length === 0)
    {
        return (
            <View style={[appTheme.styles.screen, styles.emptyContainer]}>
                <Text style={appTheme.styles.mutedText}>No addresses found</Text>
            </View>
        );
    }

    return (
        <View style={appTheme.styles.screen}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <AddressCard
                        item={item}
                        selected={item.id === addressId}
                        onSelect={setAddressId}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: 20,
        paddingBottom: 100
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AddressSelector;