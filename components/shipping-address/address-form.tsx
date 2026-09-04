import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Filter, OptionItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';
import { Combobox } from '../ui/combobox';
import Input from '../ui/input';
import { formSchema, type AddressFormValues } from './config';

export interface AutoFillResult
{
    countryId: OptionItem;
    stateId: OptionItem;
    districtId: OptionItem;
    cityId: OptionItem;
    pincodeId: OptionItem;
}

const emptyOption: OptionItem = { label: '', value: '' };

const defaultFormValues: AddressFormValues = {
    addressTypeId: {
        label: "",
        value: "426dd7ed-4cf8-4d63-da5e-a641e9cca771"
    },
    addressReferenceName: '',
    contactPersonName: '',
    addressLine1: '',
    addressLine2: '',
    mobileNo: '',
    cityId: emptyOption,
    districtId: emptyOption,
    stateId: emptyOption,
    countryId: emptyOption,
    pincodeId: emptyOption,
};

interface AddressFormProps
{
    defaultValues?: Partial<AddressFormValues>;
    onSubmit: (values: AddressFormValues) => void | Promise<void>;
    onCancel?: () => void;
    submitLabel?: string;
    disabled?: boolean;
}

const AddressForm: FC<AddressFormProps> = ({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel = 'Save Address',
    disabled = false,
}) =>
{
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { ...defaultFormValues, ...defaultValues },
    });


    const { apiActionAsync } = useApiAction();
    const [autoFilling, setAutoFilling] = useState<boolean>(false);
    const appTheme = useThemedStyles();
    const { styles: themedStyles, colors } = appTheme;

    const pincodeId = useWatch({ control, name: 'pincodeId' });

    const pinCodeCascadeFilter: Filter[] = useMemo(() =>
    {
        if (pincodeId && pincodeId.value)
        {
            return [
                {
                    id: 'Name',
                    value: {
                        alias: "pincode",
                        dataType: "text",
                        logic: "AND",
                        matchCase: "=",
                        value: pincodeId.label,
                    },
                } as Filter,
            ];
        }
        return [];
    }, [pincodeId]);

    const onPincodeChange = (pincode: OptionItem, onChange: (val: OptionItem) => void) =>
    {
        onChange(pincode);
        if (pincode && pincode.value)
        {
            (async () =>
            {
                try
                {
                    setAutoFilling(true)
                    const response = await api.get(`address/autofill?id=${pincode.value}`);
                    if (response.status == 200 && response.data)
                    {
                        const data = response.data as AutoFillResult;
                        setValue('cityId', emptyOption, { shouldDirty: true });
                        setValue('districtId', data.districtId, { shouldDirty: true });
                        setValue('stateId', data.stateId, { shouldDirty: true });
                        setValue('countryId', data.countryId, { shouldDirty: true });
                    }
                } catch (error)
                {
                    if (error instanceof AxiosError && error.response)
                    {
                        await apiActionAsync(error.response);
                    }
                }
                finally
                {
                    setAutoFilling(false)
                }
            })();
        }
    };

    const busy = disabled || isSubmitting;

    const submitHandler = handleSubmit(async (values) =>
    {
        await onSubmit(values);
    });

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                <View style={styles.fullRow}>
                    <Text style={themedStyles.text}>
                        Address Reference <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="addressReferenceName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                style={themedStyles.input}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!busy}
                                placeholder="e.g. Home, Office"
                                placeholderTextColor={colors.mutedForeground}
                            />
                        )}
                    />
                    {errors.addressReferenceName && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.addressReferenceName.message}
                        </Text>
                    )}
                </View>

                <View style={styles.fullRow}>
                    <Text style={themedStyles.text}>
                        Address 1 <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="addressLine1"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                style={themedStyles.input}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!busy}
                                placeholder="House / Street"
                                placeholderTextColor={colors.mutedForeground}
                            />
                        )}
                    />
                    {errors.addressLine1 && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.addressLine1.message}
                        </Text>
                    )}
                </View>

                <View style={styles.fullRow}>
                    <Text style={themedStyles.text}>Address 2</Text>
                    <Controller
                        control={control}
                        name="addressLine2"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                style={themedStyles.input}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!busy}
                                placeholder="Area / Landmark"
                                placeholderTextColor={colors.mutedForeground}
                            />
                        )}
                    />
                </View>

                <View style={styles.fullRow}>
                    <Text style={themedStyles.text}>
                        Contact Person <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="contactPersonName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                style={themedStyles.input}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!busy}
                                placeholder="Contact person name"
                                placeholderTextColor={colors.mutedForeground}
                            />
                        )}
                    />
                    {errors.contactPersonName && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.contactPersonName.message}
                        </Text>
                    )}
                </View>

                <View style={styles.fullRow}>
                    <Text style={themedStyles.text}>
                        Mobile No <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="mobileNo"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                style={themedStyles.input}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                editable={!busy}
                                keyboardType="phone-pad"
                                placeholder="Mobile number"
                                placeholderTextColor={colors.mutedForeground}
                            />
                        )}
                    />
                    {errors.mobileNo && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.mobileNo.message}
                        </Text>
                    )}
                </View>

                <View style={styles.fullRow}>
                    <View style={styles.labelRow}>
                        <Text style={themedStyles.text}>
                            Pincode <Text style={{ color: colors.destructive }}>*</Text>
                        </Text>
                        {autoFilling && <ActivityIndicator size="small" color={colors.primary} />}
                    </View>
                    <Controller
                        control={control}
                        name="pincodeId"
                        render={({ field: { onChange, value, ref } }) => (
                            <Combobox
                                ref={ref}
                                value={value}
                                onValueChange={(pincode: OptionItem) => onPincodeChange(pincode, onChange)}
                                path="pincode/search?optionSize=50&searchString"
                                disabled={busy}
                            />
                        )}
                    />
                    {errors.pincodeId && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.pincodeId.message}
                        </Text>
                    )}
                </View>

                <View style={styles.halfRow}>
                    <Text style={themedStyles.text}>
                        Country <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="countryId"
                        render={({ field: { onChange, value, ref } }) => (
                            <Combobox
                                ref={ref}
                                value={value}
                                onValueChange={onChange}
                                path="country/search?optionSize=50&searchString"
                                disabled={busy}
                            />
                        )}
                    />
                    {errors.countryId && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.countryId.message}
                        </Text>
                    )}
                </View>

                <View style={styles.halfRow}>
                    <Text style={themedStyles.text}>
                        State <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="stateId"
                        render={({ field: { onChange, value, ref } }) => (
                            <Combobox
                                ref={ref}
                                value={value}
                                onValueChange={onChange}
                                path="state/search?optionSize=50&searchString"
                                disabled={busy}
                            />
                        )}
                    />
                    {errors.stateId && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.stateId.message}
                        </Text>
                    )}
                </View>

                <View style={styles.halfRow}>
                    <Text style={themedStyles.text}>
                        District <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="districtId"
                        render={({ field: { onChange, value, ref } }) => (
                            <Combobox
                                ref={ref}
                                value={value}
                                onValueChange={onChange}
                                path="district/search?optionSize=50&searchString"
                                disabled={busy}
                            />
                        )}
                    />
                    {errors.districtId && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.districtId.message}
                        </Text>
                    )}
                </View>

                <View style={styles.halfRow}>
                    <Text style={themedStyles.text}>
                        Area <Text style={{ color: colors.destructive }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="cityId"
                        render={({ field: { onChange, value, ref } }) => (
                            <Combobox
                                key={pincodeId.value}
                                ref={ref}
                                value={value}
                                onValueChange={onChange}
                                cascadeFilter={pinCodeCascadeFilter}
                                path="city/search?optionSize=50&searchString"
                                disabled={busy}
                                mode="dynamic"
                            />
                        )}
                    />
                    {errors.cityId && (
                        <Text style={[themedStyles.mutedText, { color: colors.destructive }]}>
                            {errors.cityId.message}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.actions}>
                {onCancel && (
                    <TouchableOpacity
                        style={[themedStyles.button, styles.actionButton]}
                        onPress={onCancel}
                        disabled={busy}
                    >
                        <Text style={themedStyles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        busy ? themedStyles.disabledButton : themedStyles.primaryButton,
                        styles.actionButton,
                    ]}
                    onPress={submitHandler}
                    disabled={busy}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color={colors.primaryForeground} />
                    ) : (
                        <Text style={themedStyles.primaryButtonText}>{submitLabel}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing * 5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing * 2.5,
    },
    fullRow: {
        width: '100%',
        gap: spacing,
    },
    halfRow: {
        width: '48%',
        gap: spacing,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing * 2,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing * 2.5,
    },
    actionButton: {
        flex: 1,
    },
});

export default AddressForm;