import AppLogo from '@/components/common/app-logo';
import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Filter, OptionItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Eye, EyeOff, Upload, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import
{
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import { AutoFillResult } from '../address/address-form';
import { useApiAction } from '../api-actions/hook';
import { useAuth } from '../auth/config';
import { Combobox } from '../ui/combobox';

/**
 * NOTES ON PORTING FROM WEB
 * -------------------------------------------------------------------------
 * - Right visual panel ("6 Easy Steps...") omitted per request — it was
 *   `hidden lg:block` on web anyway (desktop-only), so dropping it for
 *   native loses nothing that would have shown on a phone.
 * - shadcn `<Form>/<FormField>/<Input>/<Separator>` -> plain
 *   View/Text/TextInput + `useThemedStyles()` tokens, same pattern as the
 *   other converted forms (AddFunds, etc.) in this conversation.
 * - File upload (`shopBannerFile`/`visitingCardFile`) -> `expo-document-picker`,
 *   same PickedFile shape used elsewhere. `z.instanceof(File)` swapped for
 *   `z.custom<PickedProofFile>()`.
 * - `<PasswordInput>` and `<AddressPicker>` are assumed to already have
 *   native versions at the same import paths (per the rest of this app's
 *   file-per-platform convention) — I've inlined a small local password
 *   field with a show/hide toggle here instead of assuming an external
 *   component, since its native implementation wasn't provided. Swap for
 *   your actual `PasswordInput` if one already exists.
 * - `useTheme()`'s `theme` value is used for the logo — reused the
 *   `AppLogo` component built earlier in this conversation (it already
 *   swaps light/dark logo internally via `useThemedStyles().scheme`), so
 *   the manual light/dark `<img src>` switch isn't needed here.
 * - `toast.error(...)` (sonner) -> `react-native-toast-message`.
 *
 * FIXES APPLIED (from the version this was based on)
 * -------------------------------------------------------------------------
 * - Removed a stray block of JSX that had been pasted in from a *different*
 *   component (an address-form). It referenced identifiers that don't
 *   exist in this file (`colors`, `errors`, `TouchableOpacity`, `onCancel`,
 *   `submitHandler`, `isSubmitting`, `submitLabel`) and two fields
 *   (`addressReferenceName`, `contactPersonName`) that aren't part of
 *   `formSchema`. That block would not compile. The address fields that
 *   actually belong to this form (addressLine1/2, pincodeId, countryId,
 *   stateId, districtId, cityId) are rebuilt below using the real
 *   `control` / `formState.errors` / `appTheme` from this component.
 * - Converted the single long scroll form into a 5-step wizard (Business,
 *   Personal, Address, Documents, Security) with per-step validation via
 *   RHF's `trigger()` before advancing, plus a simple progress indicator.
 * -------------------------------------------------------------------------
 */

type PickedProofFile = {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
};

const optionItemSchema = z.object({
    label: z.string(),
    value: z.string(),
});

const fileSchema = (label: string) =>
    z.array(
        z.custom<PickedProofFile>((val) => !!val && typeof val === 'object' && 'uri' in val, {
            message: `${label} is required`,
        })
    ).min(1, `${label} is required`);

const formSchema = z
    .object({
        fullName: z.string().min(3, 'Full name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        mobileNo: z.string().min(1, 'Mobile number is required'),
        companyName: z.string().min(2, 'Company name is required'),
        gstNumber: z
            .string()
            .optional()
            .refine((val) => !val || val.length === 15, { message: 'GST number must be 15 characters' })
            .refine((val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(val), {
                message: 'Invalid GST number format',
            }),
        addressLine1: z.string().min(5, 'Address1 is required'),
        addressLine2: z.string().min(5, 'Address2 is required'),
        pincodeId: optionItemSchema.refine((item) => !!item.value, { message: 'Pincode is required' }),
        countryId: optionItemSchema.refine((item) => !!item.value, { message: 'Country is required' }),
        districtId: optionItemSchema.refine((item) => !!item.value, { message: 'District is required' }),
        stateId: optionItemSchema.refine((item) => !!item.value, { message: 'State is required' }),
        cityId: optionItemSchema.refine((item) => !!item.value, { message: 'City is required' }),
        secondaryMobileNo: z.string().optional(),
        shopBannerFile: fileSchema('Company Banner'),
        visitingCardFile: fileSchema('Visiting Card'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type FormSchemaType = z.infer<typeof formSchema>;

// Field groups that make up each step of the wizard. Used both to render
// the right fields per step and to know which fields to validate before
// letting the user move on.
const STEPS = [
    { key: 'business', title: 'Business', fields: ['companyName', 'gstNumber'] as const },
    { key: 'personal', title: 'Personal', fields: ['fullName', 'email', 'mobileNo', 'secondaryMobileNo'] as const },
    {
        key: 'address',
        title: 'Address',
        fields: ['addressLine1', 'addressLine2', 'pincodeId', 'countryId', 'stateId', 'districtId', 'cityId'] as const,
    },
    { key: 'documents', title: 'Documents', fields: ['shopBannerFile', 'visitingCardFile'] as const },
    { key: 'security', title: 'Security', fields: ['password', 'confirmPassword'] as const },
] satisfies { key: string; title: string; fields: readonly (keyof FormSchemaType)[] }[];

function FieldLabel({ label, required }: { label: string; required?: boolean })
{
    const appTheme = useThemedStyles();
    return (
        <Text style={[appTheme.styles.text, { marginBottom: 6 }]}>
            {label} {required && <Text style={{ color: appTheme.colors.destructive }}>*</Text>}
        </Text>
    );
}

function ErrorText({ message }: { message?: string })
{
    const appTheme = useThemedStyles();
    if (!message) return null;
    return <Text style={{ color: appTheme.colors.destructive, fontSize: 12, marginTop: 4 }}>{message}</Text>;
}

function FileField({
    label,
    files,
    onPick,
    onRemove,
    error,
}: {
    label: string;
    files: PickedProofFile[];
    onPick: () => void;
    onRemove: () => void;
    error?: string;
})
{
    const appTheme = useThemedStyles();

    return (
        <View>
            <FieldLabel label={label} required />
            {files.length === 0 ? (
                <Pressable
                    onPress={onPick}
                    style={{
                        minHeight: 130,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: appTheme.colors.border,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                    }}
                >
                    <Upload size={20} color={appTheme.colors.mutedForeground} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: appTheme.colors.foreground }}>Tap to select file</Text>
                    <Text style={{ fontSize: 11, color: appTheme.colors.mutedForeground }}>Max size 5MB</Text>
                </Pressable>
            ) : (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: appTheme.colors.border,
                        borderRadius: 8,
                        padding: 10,
                    }}
                >
                    <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, color: appTheme.colors.foreground }}>
                        {files[0].name}
                    </Text>
                    <Pressable onPress={onRemove}>
                        <X size={16} color={appTheme.colors.mutedForeground} />
                    </Pressable>
                </View>
            )}
            <ErrorText message={error} />
        </View>
    );
}

function PasswordField({
    label,
    value,
    onChangeText,
    error,
}: {
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    error?: string;
})
{
    const appTheme = useThemedStyles();
    const [visible, setVisible] = useState(false);

    return (
        <View>
            <FieldLabel label={label} required />
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: appTheme.colors.input,
                    borderRadius: 6,
                }}
            >
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!visible}
                    placeholder="......"
                    style={[appTheme.styles.input, { flex: 1, borderWidth: 0 }]}
                />
                <Pressable onPress={() => setVisible((v) => !v)} style={{ paddingHorizontal: 12 }}>
                    {visible ? (
                        <EyeOff size={18} color={appTheme.colors.mutedForeground} />
                    ) : (
                        <Eye size={18} color={appTheme.colors.mutedForeground} />
                    )}
                </Pressable>
            </View>
            <ErrorText message={error} />
        </View>
    );
}

// Small numbered progress bar across the top of the wizard.
function StepIndicator({ currentStep }: { currentStep: number })
{
    const appTheme = useThemedStyles();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {STEPS.map((step, index) =>
            {
                const isComplete = index < currentStep;
                const isActive = index === currentStep;
                const circleColor = isComplete || isActive ? appTheme.colors.primary : appTheme.colors.border;

                return (
                    <View key={step.key} style={{ flex: 1, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                            <View
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 13,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isComplete ? appTheme.colors.primary : 'transparent',
                                    borderWidth: 1.5,
                                    borderColor: circleColor,
                                }}
                            >
                                {isComplete ? (
                                    <Check size={14} color={appTheme.colors.primaryForeground} />
                                ) : (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontWeight: '600',
                                            color: isActive ? appTheme.colors.primary : appTheme.colors.mutedForeground,
                                        }}
                                    >
                                        {index + 1}
                                    </Text>
                                )}
                            </View>
                            {index < STEPS.length - 1 && (
                                <View
                                    style={{
                                        flex: 1,
                                        height: 1.5,
                                        backgroundColor: isComplete ? appTheme.colors.primary : appTheme.colors.border,
                                    }}
                                />
                            )}
                        </View>
                        <Text
                            style={{
                                marginTop: 4,
                                fontSize: 10,
                                textAlign: 'center',
                                color: isActive ? appTheme.colors.foreground : appTheme.colors.mutedForeground,
                                fontWeight: isActive ? '600' : '400',
                            }}
                            numberOfLines={1}
                        >
                            {step.title}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        gap: spacing,
        marginBottom: spacing * 3,
    },
    stepContainer: {
        gap: spacing * 3,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing * 2.5,
        marginTop: spacing * 2,
    },
    actionButton: {
        flex: 1,
    },
});

const emptyOption: OptionItem = { label: '', value: '' };

export default function RegisterScreen()
{
    const router = useRouter();
    const { signUpAsync } = useAuth();
    const appTheme = useThemedStyles();
    const { apiActionAsync } = useApiAction();
    const [autoFilling, setAutoFilling] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState(0);

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            mobileNo: '',
            companyName: '',
            gstNumber: '',
            addressLine1: '',
            addressLine2: '',
            pincodeId: { label: '', value: '' },
            countryId: { label: '', value: '' },
            districtId: { label: '', value: '' },
            stateId: { label: '', value: '' },
            cityId: { label: '', value: '' },
            secondaryMobileNo: '',
            shopBannerFile: [],
            visitingCardFile: [],
        },
    });

    const { control, handleSubmit, setValue, watch, trigger, formState } = form;
    const shopBannerFile = watch('shopBannerFile');
    const visitingCardFile = watch('visitingCardFile');

    const pickFile = async (field: 'shopBannerFile' | 'visitingCardFile') =>
    {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['image/jpeg', 'image/png', 'application/pdf'],
            copyToCacheDirectory: true,
        });
        if (result.canceled) return;
        const asset = result.assets?.[0];
        if (!asset) return;

        if (asset.size && asset.size > 5 * 1024 * 1024)
        {
            Toast.show({ type: 'error', text1: `${field === 'shopBannerFile' ? 'Banner' : 'Visiting card'} max size is 5MB` });
            return;
        }

        setValue(field, [{ uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size }], {
            shouldValidate: true,
        });
    };

    const pincodeId = useWatch({ control, name: 'pincodeId' });

    const pinCodeCascadeFilter: Filter[] = useMemo(() =>
    {
        if (pincodeId && pincodeId.value)
        {
            return [
                {
                    id: 'Name',
                    value: {
                        alias: 'pincode',
                        dataType: 'text',
                        logic: 'AND',
                        matchCase: '=',
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
                    setAutoFilling(true);
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
                    setAutoFilling(false);
                }
            })();
        }
    };

    const busy = formState.isSubmitting;
    const isLastStep = currentStep === STEPS.length - 1;
    const onSubmit = handleSubmit((values) => signUpAsync(values as any));

    const goNext = async () =>
    {
        const fieldsToValidate = STEPS[currentStep].fields as unknown as (keyof FormSchemaType)[];
        const isStepValid = await trigger(fieldsToValidate);
        if (!isStepValid) return;

        if (isLastStep)
        {
            onSubmit();
        } else
        {
            setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
        }
    };

    const goBack = () =>
    {
        if (currentStep === 0)
        {
            router.replace('/');
        } else
        {
            setCurrentStep((step) => Math.max(step - 1, 0));
        }
    };

    return (
        <SafeAreaView style={[appTheme.styles.screen, { flex: 1 }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
                    <Pressable onPress={goBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ArrowLeft size={16} color={appTheme.colors.foreground} />
                        <Text style={{ color: appTheme.colors.foreground, fontSize: 14 }}>
                            {currentStep === 0 ? 'Back to Home' : 'Back'}
                        </Text>
                    </Pressable>

                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <AppLogo style={{ height: 100, width: 100 }} />
                    </View>

                    <View>
                        <Text style={[appTheme.styles.title, { fontSize: 22 }]}>Register</Text>
                        <Text style={appTheme.styles.mutedText}>
                            Already have an account?{' '}
                            <Text style={{ color: appTheme.colors.accent, fontWeight: '600' }} onPress={() => router.push('/auth/login')}>
                                Login
                            </Text>
                        </Text>
                    </View>

                    <StepIndicator currentStep={currentStep} />

                    <View style={styles.stepContainer}>
                        {/* Step 1: Business */}
                        {currentStep === 0 && (
                            <>
                                <Controller
                                    control={control}
                                    name="companyName"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Company name" required />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Enter your company name"
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                            <ErrorText message={formState.errors.companyName?.message} />
                                        </View>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="gstNumber"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="GST number" />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Enter 15-digit GST number"
                                                value={value}
                                                onChangeText={onChange}
                                                autoCapitalize="characters"
                                            />
                                            <ErrorText message={formState.errors.gstNumber?.message} />
                                        </View>
                                    )}
                                />
                            </>
                        )}

                        {/* Step 2: Personal */}
                        {currentStep === 1 && (
                            <>
                                <Controller
                                    control={control}
                                    name="fullName"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Full name" required />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Enter your full name"
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                            <ErrorText message={formState.errors.fullName?.message} />
                                        </View>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Email address" required />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Enter your email address"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                            <ErrorText message={formState.errors.email?.message} />
                                        </View>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="mobileNo"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Mobile no" required />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Enter 10-digit mobile number"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="phone-pad"
                                            />
                                            <ErrorText message={formState.errors.mobileNo?.message} />
                                        </View>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="secondaryMobileNo"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Secondary Mobile no" />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Enter 10-digit mobile number"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    )}
                                />
                            </>
                        )}

                        {/* Step 3: Address */}
                        {currentStep === 2 && (
                            <>
                                <Controller
                                    control={control}
                                    name="addressLine1"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Address 1" required />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="House / Street"
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                            <ErrorText message={formState.errors.addressLine1?.message} />
                                        </View>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="addressLine2"
                                    render={({ field: { onChange, value } }) => (
                                        <View style={styles.row}>
                                            <FieldLabel label="Address 2" required />
                                            <TextInput
                                                style={appTheme.styles.input}
                                                placeholder="Area / Landmark"
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                            <ErrorText message={formState.errors.addressLine2?.message} />
                                        </View>
                                    )}
                                />
                                <View style={styles.row}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <FieldLabel label="Pincode" required />
                                        {autoFilling && <ActivityIndicator size="small" color={appTheme.colors.primary} />}
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
                                    <ErrorText message={formState.errors.pincodeId?.message as string} />
                                </View>
                                <View style={styles.row}>
                                    <FieldLabel label="Country" required />
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
                                    <ErrorText message={formState.errors.countryId?.message as string} />
                                </View>
                                <View style={styles.row}>
                                    <FieldLabel label="State" required />
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
                                    <ErrorText message={formState.errors.stateId?.message as string} />
                                </View>
                                <View style={styles.row}>
                                    <FieldLabel label="District" required />
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
                                    <ErrorText message={formState.errors.districtId?.message as string} />
                                </View>
                                <View style={styles.row}>
                                    <FieldLabel label="Area" required />
                                    <Controller
                                        control={control}
                                        name="cityId"
                                        render={({ field: { onChange, value, ref } }) => (
                                            <Combobox
                                                key={pincodeId?.value}
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
                                    <ErrorText message={formState.errors.cityId?.message as string} />
                                </View>
                            </>
                        )}

                        {/* Step 4: Documents */}
                        {currentStep === 3 && (
                            <>
                                <FileField
                                    label="Upload Company Banner"
                                    files={shopBannerFile}
                                    onPick={() => pickFile('shopBannerFile')}
                                    onRemove={() => setValue('shopBannerFile', [], { shouldValidate: true })}
                                    error={formState.errors.shopBannerFile?.message as string}
                                />
                                <FileField
                                    label="Upload Visiting Card"
                                    files={visitingCardFile}
                                    onPick={() => pickFile('visitingCardFile')}
                                    onRemove={() => setValue('visitingCardFile', [], { shouldValidate: true })}
                                    error={formState.errors.visitingCardFile?.message as string}
                                />
                            </>
                        )}

                        {/* Step 5: Security */}
                        {currentStep === 4 && (
                            <>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({ field: { onChange, value } }) => (
                                        <PasswordField
                                            label="Password"
                                            value={value}
                                            onChangeText={onChange}
                                            error={formState.errors.password?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name="confirmPassword"
                                    render={({ field: { onChange, value } }) => (
                                        <PasswordField
                                            label="Confirm password"
                                            value={value}
                                            onChangeText={onChange}
                                            error={formState.errors.confirmPassword?.message}
                                        />
                                    )}
                                />
                                <Text style={[appTheme.styles.mutedText, { textAlign: 'center' }]}>
                                    By continuing, you agree to our{' '}
                                    <Text style={{ color: '#2563eb', fontWeight: '600' }} onPress={() => router.push('/termsandconditions')}>
                                        Terms of Service
                                    </Text>{' '}
                                    and{' '}
                                    <Text style={{ color: '#2563eb', fontWeight: '600' }} onPress={() => router.push('/privacypolicy')}>
                                        Privacy Policy
                                    </Text>
                                </Text>
                            </>
                        )}
                    </View>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={goBack}
                            disabled={busy}
                            style={[appTheme.styles.button ?? appTheme.styles.primaryButton, styles.actionButton, busy && { opacity: 0.7 }]}
                        >
                            <Text style={appTheme.styles.buttonText ?? appTheme.styles.primaryButtonText}>
                                {currentStep === 0 ? 'Cancel' : 'Back'}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={goNext}
                            disabled={busy}
                            style={[appTheme.styles.primaryButton, styles.actionButton, busy && { opacity: 0.7 }]}
                        >
                            {busy ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                    <ActivityIndicator color={appTheme.colors.primaryForeground} />
                                    <Text style={appTheme.styles.primaryButtonText}>Submitting...</Text>
                                </View>
                            ) : (
                                <Text style={appTheme.styles.primaryButtonText}>{isLastStep ? 'Create Account' : 'Next'}</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}