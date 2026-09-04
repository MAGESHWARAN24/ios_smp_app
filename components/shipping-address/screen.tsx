import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import { Plus, X } from 'lucide-react-native';
import { useState, type FC } from 'react';
import
{
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';
import Input from '../ui/input';
import AddressCard from './address-card';
import AddressForm from './address-form';
import type { AddressFormValues } from './config';
import { useShippingAddress } from './config';
import Provider from './provider';
import { Address } from './type';

interface ShippingAddressScreenProps { }

const PAGE_SIZE = 25;

// NOTE: assumes the paged `Address` items returned by the API include the raw
// fields (addressLine1/2, cityId, districtId, stateId, countryId, pincodeId,
// addressTypeId) alongside the pre-formatted `address` display string used by
// AddressCard — if the list endpoint only returns the flattened string, the
// edit form below will need a separate `GET` by id to populate defaultValues.

function ShippingAddressScreenContent()
{
    const { address, loading, fetchData, debouncedFilter } = useShippingAddress()
    const { apiActionAsync } = useApiAction()
    const { colors, styles } = useThemedStyles()

    const [search, setSearch] = useState('')
    const [pageNumber, setPageNumber] = useState(1)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const totalPages = address.totalPages || 1
    const canGoPrevious = pageNumber > 1 && !loading
    const canGoNext = pageNumber < totalPages && !loading

    const onSearchChange = (value: string) =>
    {
        setSearch(value)
        setPageNumber(1)
        debouncedFilter(value)
    }

    const goToPage = async (page: number) =>
    {
        setPageNumber(page)
        await fetchData(search, PAGE_SIZE, page)
    }

    const onPrevious = () =>
    {
        if (canGoPrevious)
        {
            goToPage(pageNumber - 1)
        }
    }

    const onNext = () =>
    {
        if (canGoNext)
        {
            goToPage(pageNumber + 1)
        }
    }

    const openCreate = () =>
    {
        setEditingAddress(null)
        setModalVisible(true)
    }

    const openEdit = (id: string) =>
    {
        const found = address.items.find((item) => item.id === id) ?? null
        setEditingAddress(found)
        setModalVisible(true)
    }

    const closeModal = () =>
    {
        setModalVisible(false)
        setEditingAddress(null)
    }

    const onDelete = (id: string) =>
    {
        Alert.alert(
            'Delete address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () =>
                    {
                        setDeletingId(id)
                        try
                        {
                            const response = await api.delete(`customeraddresses/delete?id=${id}`)
                            if (response.status === 200)
                            {
                                await fetchData(search, PAGE_SIZE, pageNumber)
                            }
                        } catch (error)
                        {
                            if (error instanceof AxiosError && error.response)
                            {
                                await apiActionAsync(error.response)
                            }
                        } finally
                        {
                            setDeletingId(null)
                        }
                    },
                },
            ]
        )
    }

    const onSubmit = async (values: AddressFormValues) =>
    {
        try
        {
            const response = editingAddress
                ? await api.post(`customeraddresses/update?id=${editingAddress.id}`, values)
                : await api.post('customeraddresses/create', values)

            if (response.status === 200)
            {
                closeModal()
                await fetchData(search, PAGE_SIZE, pageNumber)
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        }
    }

    return (
        <SafeAreaView style={[styles.screen]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing * 2, padding: spacing * 4 }}>
                <View style={{ flex: 1 }}>
                    <Input
                        value={search}
                        onChangeText={onSearchChange}
                        placeholder="Search addresses..."
                        placeholderTextColor={colors.mutedForeground}
                        style={styles.input}
                    />
                </View>
                <Pressable
                    onPress={openCreate}
                    style={{
                        height: 44,
                        width: 44,
                        borderRadius: 12,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Plus size={20} color={colors.primaryForeground} />
                </Pressable>
            </View>

            {loading && address.items.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={address.items}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ gap: spacing, padding: spacing * 2 }}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', paddingVertical: 32, fontSize: 13, color: colors.mutedForeground }}>
                            No addresses saved yet.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={{ position: 'relative' }}>
                            <AddressCard item={item as any} onEdit={openEdit} onDelete={onDelete} />
                            {deletingId === item.id && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: colors.background + 'aa',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 16,
                                    }}
                                >
                                    <ActivityIndicator color={colors.destructive} />
                                </View>
                            )}
                        </View>
                    )}
                />
            )}

            {/* Pagination footer */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing * 4,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                }}
            >
                <Pressable
                    onPress={onPrevious}
                    disabled={!canGoPrevious}
                    style={{
                        paddingVertical: spacing * 2,
                        paddingHorizontal: spacing * 4,
                        borderRadius: 8,
                        backgroundColor: canGoPrevious ? colors.primary : colors.muted,
                    }}
                >
                    <Text style={{ color: canGoPrevious ? colors.primaryForeground : colors.mutedForeground, fontWeight: 'bold' }}>
                        Previous
                    </Text>
                </Pressable>

                <Text style={[styles.mutedText, { fontSize: 12 }]}>
                    Page {address.pageNumber || pageNumber} of {totalPages}
                </Text>

                <Pressable
                    onPress={onNext}
                    disabled={!canGoNext}
                    style={{
                        paddingVertical: spacing * 2,
                        paddingHorizontal: spacing * 4,
                        borderRadius: 8,
                        backgroundColor: canGoNext ? colors.primary : colors.muted,
                    }}
                >
                    <Text style={{ color: canGoNext ? colors.primaryForeground : colors.mutedForeground, fontWeight: 'bold' }}>
                        Next
                    </Text>
                </Pressable>
            </View>

            <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
                <SafeAreaView style={[styles.screen, { flex: 1 }]} edges={['top', 'bottom']}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: spacing * 4,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground }}>
                            {editingAddress ? 'Edit Address' : 'Add Address'}
                        </Text>
                        <Pressable onPress={closeModal} hitSlop={8}>
                            <X size={20} color={colors.foreground} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: spacing * 4 }} keyboardShouldPersistTaps="handled">
                        <AddressForm
                            defaultValues={editingAddress ? (editingAddress as unknown as Partial<AddressFormValues>) : undefined}
                            onSubmit={onSubmit}
                            onCancel={closeModal}
                            submitLabel={editingAddress ? 'Update Address' : 'Save Address'}
                        />
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    )
}

const ShippingAddressScreen: FC<ShippingAddressScreenProps> = () =>
{
    return (
        <Provider>
            <ShippingAddressScreenContent />
        </Provider>
    );
}

export default ShippingAddressScreen;