import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';
import CheckoutFooter from '../checkout/checkout-footer';
import { useCheckout } from '../checkout/config';
import AddressForm from './address-form';
import AddressSelector from './address-selector';
import type { AddressFormValues } from './config';
import { useAddress } from './config';
import SearchBar from './search-bar';

interface AddressScreenProps { }

const AddressScreen: FC<AddressScreenProps> = () =>
{
    const appTheme = useThemedStyles();
    const { colors, styles: themedStyles } = appTheme;
    const { fetchData } = useAddress();
    const [formOpen, setFormOpen] = useState(false);
    const { apiActionAsync } = useApiAction()
    const { setAddressId, addressId } = useAddress()
    const { fetchSummary, summary } = useCheckout()
    const handleSubmit = async (values: AddressFormValues) =>
    {
        try
        {
            const response = await api.post('customeraddresses/create', values);
            Alert.alert("", JSON.stringify(response))
            if (response.status == 200 && response.data)
            {
                setAddressId(response.data.id)
            }
        }
        catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
            Alert.alert("", JSON.stringify(error))
        }
        finally
        {
            setFormOpen(false);
            fetchData("");
        }
    };

    useEffect(() =>
    {
        fetchSummary(addressId, "")
    }, [])

    useEffect(() =>
    {
        
    }, [])

    return (
        <View style={[appTheme.styles.screen, styles.container]}>
            <SearchBar />

            <Pressable
                onPress={() => setFormOpen(true)}
                style={[themedStyles.primaryButton, styles.addButton]}
            >
                <Text style={themedStyles.primaryButtonText}>+ Add New Address</Text>
            </Pressable>

            <AddressSelector />

            <Modal
                visible={formOpen}
                animationType="slide"
                onRequestClose={() => setFormOpen(false)}
            >
                <View style={[styles.modalContainer]}>
                    <View style={styles.modalHeader}>
                        <Text style={themedStyles.title}>Add New Address</Text>
                        <Pressable onPress={() => setFormOpen(false)}>
                            <Text style={[themedStyles.text, { color: colors.mutedForeground }]}>Close</Text>
                        </Pressable>
                    </View>

                    <AddressForm
                        onSubmit={handleSubmit}
                        onCancel={() => setFormOpen(false)}
                        submitLabel="Save Address"
                    />
                </View>
            </Modal>
            <CheckoutFooter
                isHasNextPage={!!addressId}
                nextPageLabel='Next'
                onPressHandler={() =>
                {
                    router.push(`checkout/${addressId}/transportmode`)
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: spacing * 3,
    },
    addButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing * 4,
        marginLeft: 'auto'
    },
    modalContainer: {
        padding: spacing * 4,
        gap: spacing * 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default AddressScreen;