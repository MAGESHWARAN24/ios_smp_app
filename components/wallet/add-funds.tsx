import { api } from "@/lib/api";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Landmark, Plus, QrCode, Smartphone, Upload, Wallet, X, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import
{
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { z } from "zod";
import { useApiAction } from "../api-actions/hook";
import PaymentNEFT from "./payment-neft";
import PaymentQRCode from "./payment-qr-code";

/**
 * NOTES ON PORTING FROM WEB
 * -------------------------------------------------------------------------
 * - shadcn `<Card>/<Form>/<Input>/<InputGroup>/<FileUpload>` all have no RN
 *   equivalent - rebuilt with plain View/Text/TextInput + the shared
 *   `useThemedStyles()` tokens from theme.ts so it matches the rest of
 *   the app's styling.
 * - `zod` + `react-hook-form` + `zodResolver` are UI-agnostic and port
 *   1:1 - only the `proofDocument` field type changes (browser `File` ->
 *   picked-asset shape from `expo-document-picker`).
 * - File upload: browser `<input type="file">` -> `expo-document-picker`.
 *   Kept as a 1-item array in the form value to match the original
 *   schema/shape as closely as possible.
 * - CC Avenue redirect: the web version built a hidden <form> and called
 *   `.submit()` to POST-redirect the browser to the payment gateway.
 *   There's no browser to redirect on native. This opens a `WebView` in a
 *   full-screen Modal and injects a tiny self-submitting HTML form so the
 *   POST still happens exactly the way CC Avenue expects, just inside the
 *   WebView instead of the OS browser.
 * - `navigate(0)` (full page reload) has no RN equivalent - replaced with
 *   an `onSuccess` callback prop so the parent screen can decide how to
 *   refresh (e.g. refetch wallet info, or `navigation.replace(...)` to
 *   remount the screen). Wire this up from wherever <AddFunds> is used.
 * -------------------------------------------------------------------------
 */

type PickedProofFile = {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
};

const quickAmounts = [100, 250, 500, 750, 1000, 2000];

const PaymentMode = [
    {
        label: "CC Avenue",
        value: "6e41261d-2f07-880f-e86e-867213454d82",
        icon: Zap,
        btnIcon: QrCode,
        btnLabel: "Show QR code to pay Rs ",
        modeUI: PaymentQRCode,
        showProofForm: false,
    },
    {
        label: "Challan Upload",
        value: "f7ba2a38-0191-ab37-c57d-c65e0d95c45c",
        icon: Smartphone,
        btnIcon: QrCode,
        btnLabel: "Show QR code to pay Rs ",
        modeUI: PaymentQRCode,
        showProofForm: true,
    },
    {
        label: "NEFT / RTGS",
        value: "f4d52b0d-a4fa-4dbb-b855-c215ac55e509",
        icon: Wallet,
        btnIcon: Landmark,
        btnLabel: "View bank details for Rs ",
        modeUI: PaymentNEFT,
        showProofForm: true,
    },
];

const formSchema = z
    .object({
        paymentTypeId: z.string(),
        amount: z.coerce
            .number<number>()
            .min(100, "Minimum top-up amount is Rs 100")
            .max(100000, "Maximum top-up amount is Rs 1,00,000"),
        transacationReferenceNo: z.string().optional(),
        proofDocument: z.array(z.custom<PickedProofFile>()).optional(),
    })
    .superRefine((data, ctx) =>
    {
        const isCCAvenue = data.paymentTypeId === "6e41261d-2f07-880f-e86e-867213454d82";

        if (!isCCAvenue)
        {
            if (!data.transacationReferenceNo || data.transacationReferenceNo.trim() === "")
            {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Transaction reference number is required",
                    path: ["transacationReferenceNo"],
                });
            }

            if (!data.proofDocument || data.proofDocument.length < 1)
            {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Transaction proof is required",
                    path: ["proofDocument"],
                });
            }
        }

        const isGPay = data.paymentTypeId === "f7ba2a38-0191-ab37-c57d-c65e0d95c45c";
        if (isGPay && data.amount > 100000)
        {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "GPay/UPI payments are limited to Rs 1,00,000 per transaction",
                path: ["amount"],
            });
        }
    });

type FormSchemaType = z.infer<typeof formSchema>;

function buildFormData(payload: Record<string, any>)
{
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) =>
    {
        if (value === null || value === undefined) return;
        if (typeof value === "object" && "uri" in value && "name" in value)
        {
            formData.append(key, {
                uri: value.uri,
                name: value.name,
                type: value.mimeType ?? "application/octet-stream",
            } as any);
        } else
        {
            formData.append(key, String(value));
        }
    });
    return formData;
}

interface AddFundsProps
{
    onSuccess?: () => void;
}

const AddFunds = ({ onSuccess }: AddFundsProps) =>
{
    const { colors, styles } = useThemedStyles();
    const [isShow, setShow] = useState(false);
    const { apiActionAsync } = useApiAction();

    const form = useForm<FormSchemaType>({
        defaultValues: {
            amount: 0,
            proofDocument: [],
            transacationReferenceNo: "",
        },
        resolver: zodResolver(formSchema),
    });

    const { control, handleSubmit, formState, setError, setValue, reset } = form;

    const amount = useWatch({ control, name: "amount" });
    const paymentTypeId = useWatch({ control, name: "paymentTypeId" });
    const proofDocument = useWatch({ control, name: "proofDocument" });
    const router = useRouter()
    const pickProofDocument = async () =>
    {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/jpeg", "image/png", "application/pdf"],
            copyToCacheDirectory: true,
        });
        if (result.canceled) return;
        const asset = result.assets?.[0];
        if (!asset) return;

        if (asset.size && asset.size > 5 * 1024 * 1024)
        {
            setError("proofDocument", { message: "File must be under 5MB" });
            return;
        }

        setValue("proofDocument", [
            { uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size },
        ]);
    };

    const handleOnSubmit = async (payload: FormSchemaType) =>
    {
        try
        {
            const isCCAvenue = payload.paymentTypeId === "6e41261d-2f07-880f-e86e-867213454d82";
            const url = isCCAvenue ? `wallettopups/addfund/ccavenue` : `wallettopups/addfund`;

            const formData = buildFormData({
                ...payload,
                proofDocument:
                    Array.isArray(payload.proofDocument) && payload.proofDocument.length > 0
                        ? payload.proofDocument[0]
                        : null,
            });

            const response = await api.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (isCCAvenue)
            {
                const { encryptedData, accessCode, paymentUrl } = response.data;
                router.navigate(`payment/${encodeURIComponent(paymentUrl)}/${encodeURIComponent(encryptedData)}/${encodeURIComponent(accessCode)}`)
                reset();
                return;
            }

            if (response.status === 200 && response.data)
            {
                reset();
                await apiActionAsync(response);
                onSuccess?.();
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
            }
        }
    };

    return (
        <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Plus size={20} color={colors.cardForeground} />
                <Text style={styles.title}>Add Funds</Text>
            </View>
            <Text style={styles.mutedText}>Top up your wallet balance</Text>

            <View style={{ gap: 16, marginTop: 16 }}>
                {/* Amount input */}
                <View>
                    <Text style={styles.text}>Amount</Text>
                    <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value } }) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: colors.input,
                                    borderRadius: 6,
                                    marginTop: 6,
                                }}
                            >
                                <Text style={{ paddingHorizontal: 12, color: colors.mutedForeground }}>Rs</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    value={String(value ?? "")}
                                    onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ""))}
                                    style={[styles.input, { flex: 1, borderWidth: 0, backgroundColor: 'transparent' }]}
                                />
                            </View>
                        )}
                    />
                    {formState.errors.amount && (
                        <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 4 }}>
                            {formState.errors.amount.message}
                        </Text>
                    )}
                </View>

                {/* Quick amounts */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {quickAmounts.map((value) => (
                        <TouchableOpacity
                            key={value}
                            onPress={() => setValue("amount", value)}
                            style={[
                                { flexBasis: "30%", paddingVertical: 10, borderRadius: 6, borderWidth: 1, alignItems: "center" },
                                amount === value
                                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                    : { borderColor: colors.border },
                            ]}
                        >
                            <Text style={{ color: amount === value ? colors.primaryForeground : colors.foreground, fontSize: 13 }}>
                                Rs{value}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Payment mode */}
                <View>
                    <Text style={styles.text}>Payment</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                        {PaymentMode.map((mode) =>
                        {
                            const Icon = mode.icon;
                            const selected = paymentTypeId === mode.value;
                            const disabled = amount < 100;
                            return (
                                <TouchableOpacity
                                    key={mode.value}
                                    disabled={disabled}
                                    onPress={() => setValue("paymentTypeId", mode.value)}
                                    style={{
                                        height: 96,
                                        flexBasis: "31%",
                                        borderWidth: 1,
                                        borderColor: selected ? colors.primary : colors.border,
                                        borderRadius: 8,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        opacity: disabled ? 0.5 : 1,
                                    }}
                                >
                                    <Icon size={20} color={selected ? colors.primary : colors.foreground} />
                                    <Text style={{ fontSize: 11, color: selected ? colors.primary : colors.foreground }}>
                                        {mode.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Proof form for selected mode */}
                {PaymentMode.map((mode) =>
                {
                    if (mode.value !== paymentTypeId || !mode.showProofForm) return null;
                    const ModeUI = mode.modeUI;
                    const BtnIcon = mode.btnIcon;

                    return (
                        <View key={mode.value} style={{ gap: 10 }}>
                            {!isShow && (
                                <TouchableOpacity style={styles.primaryButton} onPress={() => setShow(true)}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <BtnIcon size={16} color={colors.primaryForeground} />
                                        <Text style={styles.primaryButtonText}>
                                            {mode.btnLabel}
                                            {amount}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {isShow && (
                                <>
                                    <ModeUI />

                                    <View>
                                        <Text style={styles.text}>
                                            Transaction Reference No (UTR) <Text style={{ color: colors.destructive }}>*</Text>
                                        </Text>
                                        <Controller
                                            control={control}
                                            name="transacationReferenceNo"
                                            render={({ field: { onChange, value } }) => (
                                                <TextInput
                                                    style={[styles.input, { marginTop: 6 }]}
                                                    value={value}
                                                    onChangeText={onChange}
                                                />
                                            )}
                                        />
                                        {formState.errors.transacationReferenceNo && (
                                            <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 4 }}>
                                                {formState.errors.transacationReferenceNo.message}
                                            </Text>
                                        )}
                                    </View>

                                    <View>
                                        <Text style={styles.text}>
                                            Upload Proof <Text style={{ color: colors.destructive }}>*</Text>
                                        </Text>

                                        {(!proofDocument || proofDocument.length === 0) && (
                                            <TouchableOpacity
                                                onPress={pickProofDocument}
                                                style={{
                                                    minHeight: 150,
                                                    borderWidth: 1,
                                                    borderStyle: "dashed",
                                                    borderColor: colors.border,
                                                    borderRadius: 8,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 8,
                                                    marginTop: 6,
                                                }}
                                            >
                                                <Upload size={22} color={colors.mutedForeground} />
                                                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                                                    Tap to select file
                                                </Text>
                                                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Max size 5MB</Text>
                                            </TouchableOpacity>
                                        )}

                                        {proofDocument?.map((file, index) => (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                    borderRadius: 8,
                                                    padding: 10,
                                                    marginTop: 6,
                                                }}
                                            >
                                                <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, color: colors.foreground }}>
                                                    {file.name}
                                                </Text>
                                                <TouchableOpacity onPress={() => setValue("proofDocument", [])}>
                                                    <X size={16} color={colors.mutedForeground} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        {formState.errors.proofDocument && (
                                            <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 4 }}>
                                                {formState.errors.proofDocument.message as string}
                                            </Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={() =>
                                        {
                                            reset();
                                            setShow(false);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    );
                })}

                <TouchableOpacity
                    style={formState.isSubmitting || amount === 0 ? styles.disabledButton : styles.primaryButton}
                    disabled={formState.isSubmitting || amount === 0}
                    onPress={handleSubmit(handleOnSubmit)}
                >
                    {formState.isSubmitting ? (
                        <ActivityIndicator color={colors.primaryForeground} />
                    ) : (
                        <Text style={amount === 0 ? styles.disabledButtonText : styles.primaryButtonText}>
                            Add Rs {amount}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddFunds;