// import { api } from '@/lib/api';
// import { radius } from '@/lib/theme';
// import { useThemedStyles } from '@/lib/useThemedStyles';
// import { IconOptionItem } from '@/types';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { AxiosError } from 'axios';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { Clock, Package, ShoppingCart, Truck } from 'lucide-react-native';
// import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
// import { Controller, FormProvider, Controller as RHFController, useFieldArray, useForm, useWatch } from 'react-hook-form';
// import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useApiAction } from '../api-actions/hook';
// import DesignFilePreviewCard from '../design-file-upload/design-file-preview';
// import DesignFileUpload from '../design-file-upload/design-file-upload';
// import Input from '../ui/input';
// import { defaultValue, formSchema, FormSchemaType } from './config';
// import { DesignFileProduct } from './type';
// interface UploadDesignScreenProps { }

// interface Dimensions
// {
//     height: number
//     width: number
// }
// const appendFormData = (formData: FormData, key: string, value: any) =>
// {
//     if (value === undefined || value === null) return;

//     // RN picked-file shape -> append as an actual file part
//     if (typeof value === "object" && !Array.isArray(value) && "uri" in value && "name" in value)
//     {
//         formData.append(key, {
//             uri: value.uri,
//             name: value.name,
//             type: value.mimeType || value.type || "application/octet-stream",
//         } as any);
//         return;
//     }

//     if (Array.isArray(value))
//     {
//         value.forEach((item, index) =>
//         {
//             if (item !== null && typeof item === "object")
//             {
//                 appendFormData(formData, `${key}[${index}]`, item);
//             } else
//             {
//                 // repeated same key = how ASP.NET binds List<string>/List<T> from form data
//                 formData.append(key, String(item));
//             }
//         });
//         return;
//     }

//     if (typeof value === "object")
//     {
//         Object.entries(value).forEach(([subKey, subValue]) =>
//             appendFormData(formData, `${key}.${subKey}`, subValue)
//         );
//         return;
//     }

//     formData.append(key, String(value));
// };

// const UploadDesignScreen: FC<UploadDesignScreenProps> = () =>
// {
//     const appTheme = useThemedStyles()
//     const { productId = "", quantityId = "" } = useLocalSearchParams<{ quantityId: string, productId: string }>()
//     const [item, setItem] = useState<DesignFileProduct>(defaultValue)
//     const [loading, setLoading] = useState<boolean>(false)
//     const [dimensions, setDimensions] = useState<Dimensions>({ height: 0, width: 0 })
//     const { apiActionAsync } = useApiAction()
//     const uploadDesignForm = useForm<FormSchemaType>({
//         defaultValues: {
//             attachments: [],
//             customerId: "",
//             id: "",
//             imageUrl: "",
//             instruction: "",
//             otherSpecification: [],
//             productId,
//             quantityId
//         },
//         mode: "onChange",
//         resolver: zodResolver(formSchema)
//     })
//     const { control, formState, handleSubmit, setValue } = uploadDesignForm
//     const { fields } = useFieldArray({ control, name: "attachments", keyName: "uId" })
//     const otherSpecification = useWatch({ control, name: "otherSpecification" });
//     const attachmentsWatch = useWatch({ control, name: "attachments" });
//     const router = useRouter()
//     const inset = useSafeAreaInsets()
//     const cellCount = useMemo(
//         () => (attachmentsWatch?.length > 0 ? attachmentsWatch[0].cellCount : 1),
//         [attachmentsWatch]
//     );
//     const configItem = useMemo(() =>
//     {
//         if (item)
//         {
//             let options: IconOptionItem[] = []
//             if (item.quantity.value)
//             {
//                 options = [...options, { icon: Clock, label: "2 to 3 working days", value: "Turnaround" }]
//             }

//             if (item.turnAroundDays)
//             {
//                 options = [...options, { icon: Package, label: item.quantity.label, value: "Min. Order" }]
//             }

//             options = [...options, { icon: Truck, label: "Shipping", value: "All over india" }]

//             return options;
//         }

//         return []
//     }, [item])

//     const additionalPrices = useMemo(() =>
//     {
//         if (!item.otherSpecifications) return 0;
//         return item.otherSpecifications
//             .filter((item) => otherSpecification.includes(item.value))
//             .reduce((acc, curr) => acc + curr.price * (Math.ceil((item.noOfQuantity * 1) / curr.minQuantity)), 0);
//     }, [otherSpecification, item.otherSpecifications]);

//     const totalAmount = useMemo(
//         () => ((cellCount == 0 ? 1 : cellCount) * item.price) + additionalPrices,
//         [cellCount, item, additionalPrices]
//     );

//     const removeDocument = useCallback(
//         (fieldIndex: number, imageTypeId: string) =>
//         {
//             const current = attachmentsWatch ?? [];
//             setValue(
//                 "attachments",
//                 current.map((a, i) =>
//                     i === fieldIndex && a.imageTypeId === imageTypeId
//                         ? {
//                             ...a,
//                             document: undefined,
//                             isValid: false,
//                             cellCount: 0,
//                             currentDPI: 0,
//                             documentHeightInMM: 0,
//                             documentHeightInPx: 0,
//                             documentWidthInMM: 0,
//                             documentWidthInPx: 0,
//                             colorSpace: undefined,
//                             imageUrl: "",
//                         }
//                         : a
//                 ),
//                 { shouldValidate: true, shouldDirty: true }
//             );
//         },
//         [attachmentsWatch, setValue]
//     );

//     useEffect(() =>
//     {
//         const fetchData = async () =>
//         {
//             try
//             {
//                 setLoading(false)
//                 const response = await api.get(`product/getbyid?id=${productId}&quantityId=${quantityId}`)
//                 if (response.status == 200 && response.data)
//                 {
//                     setItem(response.data)
//                     setDimensions({ height: response.data.uploadDimensions.height, width: response.data.uploadDimensions.width })
//                     uploadDesignForm.reset({
//                         attachments: response.data.attachments,
//                         productId,
//                         quantityId,
//                         customerId: "",
//                         instruction: "",
//                         imageUrl: "",
//                         id: "",
//                         otherSpecification: []
//                     })
//                 }

//             } catch (error)
//             {
//                 if (error instanceof AxiosError && error.response)
//                 {
//                     await apiActionAsync(error.response)
//                 }
//             }
//             finally
//             {
//                 setLoading(true)
//             }
//         }

//         fetchData()
//     }, [quantityId, productId])


//     const onSubmitAsync = async (payload: FormSchemaType) =>
//     {
//         try
//         {
//             const formData = new FormData();
//             appendFormData(formData, "Id", "");
//             appendFormData(formData, "CustomerId", "");
//             appendFormData(formData, "ProductId", payload.productId);
//             appendFormData(formData, "QuantityId", payload.quantityId);
//             appendFormData(formData, "Instruction", payload.instruction);
//             appendFormData(formData, "OtherSpecification", payload.otherSpecification);
//             appendFormData(formData, "Attachments", payload.attachments);

//             const response = await api.post("cart/create", formData, {
//                 headers: { "Content-Type": "multipart/form-data" }
//             });

//             if (response.status === 200 && response.data)
//             {
//                 router.navigate("/cart")
//             }
//         } catch (error)
//         {
//             if (error instanceof AxiosError && error.response)
//             {
//                 await apiActionAsync(error.response);
//             }
//         }
//     };


//     const styles = useMemo(() => StyleSheet.create({
//         container: {
//             padding: 10,
//             gap: 5
//         },
//         label: {
//             fontSize: 18,
//             fontWeight: "600"
//         },
//         instruction: {
//             height: 120,
//             justifyContent: "flex-start",
//             textAlignVertical: 'top',
//             padding: 12,
//             fontSize: 16,
//         },
//         controllerContainer: {
//             gap: 6
//         },
//         badge: {
//             paddingVertical: 8,
//             paddingHorizontal: 10,
//             fontSize: 14,
//             borderWidth: 1,
//             borderRadius: radius.sm,
//             fontWeight: "bold",
//             height: 40,
//             flex: 1,
//             flexDirection: 'row',
//             alignItems: "flex-start",
//             justifyContent: "flex-start",
//             gap: 10
//         },
//         checked: {
//             borderColor: appTheme.colors.primary,
//             backgroundColor: appTheme.colors.primary,
//             color: appTheme.colors.background,
//         },
//         unchecked: {
//             borderColor: appTheme.colors.border,
//             backgroundColor: appTheme.colors.card,
//             color: appTheme.colors.primary
//         },
//         price: {
//             fontSize: 14,
//             fontWeight: "bold",
//             marginLeft: "auto"
//         },
//         errorText: {
//             fontSize: 12,
//             color: appTheme.colors.destructive,
//             marginTop: 4,
//         },
//         screenWrap: {
//             flex: 1,
//         },
//         scrollContent: {
//             paddingBottom: 24,
//         },
//         footer: {
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//             paddingHorizontal: 22,
//             paddingVertical: 14,
//             borderTopWidth: 1,
//             borderTopColor: appTheme.colors.border,
//             backgroundColor: appTheme.colors.card,
//             height: 60 + inset.bottom
//         },
//         footerLeft: {
//             gap: 2,
//         },
//         totalLabel: {
//             fontSize: 12,
//             color: appTheme.colors.mutedForeground,
//         },
//         totalValue: {
//             fontSize: 20,
//             fontWeight: "700",
//             color: appTheme.colors.cardForeground,
//         },
//         addToCartBtn: {
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 8,
//             paddingHorizontal: 20,
//             paddingVertical: 12,
//             borderRadius: radius.md,
//             backgroundColor: appTheme.colors.primary,
//         },
//         addToCartBtnDisabled: {
//             opacity: 0.6,
//         },
//         addToCartText: {
//             color: appTheme.colors.primaryForeground,
//             fontSize: 15,
//             fontWeight: "600",
//         },
//         infoContainer: {
//             flex: 3,
//             flexDirection: 'row',
//             paddingVertical: 10,
//             gap: 10,
//             justifyContent: 'space-evenly'
//         },
//         infoCard: {
//             flex: 1,
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 5
//         },
//         infoCardTitle: {
//             fontWeight: 'bold',
//             textAlign: "center",
//         },
//         infoCardDescription: {
//             color: appTheme.colors.mutedForeground
//         }
//     }), [appTheme.colors])

//     return (
//         <FormProvider {...uploadDesignForm}>
//             <View style={styles.screenWrap}>
//                 <ScrollView style={appTheme.styles.screen} contentContainerStyle={styles.scrollContent}>
//                     <View style={[styles.container]}>
//                         <Text style={[styles.label]}>{item.name}</Text>
//                         {configItem.length == 0 ? null : (
//                             <View style={[styles.infoContainer]}>
//                                 {configItem.map((Item, idx) => (
//                                     <View key={idx} style={[appTheme.styles.card, styles.infoCard]}>
//                                         <Item.icon color={appTheme.colors.primary} />
//                                         <Text style={[styles.infoCardTitle]}>{Item.label}</Text>
//                                         <Text style={[styles.infoCardDescription]}>{Item.value}</Text>
//                                     </View>
//                                 ))}
//                             </View>
//                         )}
//                         {item.otherSpecifications.length > 0 && <Text style={styles.label}>Additional Operations</Text>}
//                         {item.otherSpecifications.length > 0 && (<RHFController
//                             control={control}
//                             name='otherSpecification'
//                             render={({ field }) => (
//                                 <View style={styles.controllerContainer}>
//                                     {item.otherSpecifications.map((spec) =>
//                                     {
//                                         const checked = field.value.includes(spec.value)
//                                         return (
//                                             <Pressable
//                                                 key={spec.value}
//                                                 onPress={() =>
//                                                 {
//                                                     if (item.optionType == "f7ba2a38-0191-ab37-c57d-c65e0d95c45c")
//                                                     {
//                                                         const next = !checked
//                                                             ? [...field.value, spec.value]
//                                                             : field.value.filter((x) => x !== spec.value);
//                                                         field.onChange(next);
//                                                     }

//                                                     if (item.optionType == "f4d52b0d-a4fa-4dbb-b855-c215ac55e509")
//                                                     {
//                                                         const next = !checked ? [spec.value] : [];
//                                                         field.onChange(next);
//                                                     }
//                                                 }}
//                                             >
//                                                 <View
//                                                     style={[
//                                                         styles.badge,
//                                                         checked
//                                                             ? styles.checked
//                                                             : styles.unchecked
//                                                     ]}
//                                                 >
//                                                     <Text
//                                                         style={[
//                                                             checked
//                                                                 ? styles.checked
//                                                                 : styles.unchecked
//                                                         ]}
//                                                     >
//                                                         {spec.label}
//                                                     </Text>
//                                                     <Text
//                                                         style={[
//                                                             checked
//                                                                 ? styles.checked
//                                                                 : styles.unchecked,
//                                                             styles.price
//                                                         ]}
//                                                     >
//                                                         Rs {spec.price * (Math.ceil((item.noOfQuantity == 0 ? 1 : item.noOfQuantity * 1) / spec.minQuantity))}
//                                                     </Text>
//                                                 </View>
//                                             </Pressable>
//                                         )
//                                     })}
//                                 </View>
//                             )}
//                         />)}
//                         <Text style={styles.label}>Instruction </Text>
//                         <RHFController
//                             control={control}
//                             name='instruction'
//                             render={({ field }) => (
//                                 <View>
//                                     <Input
//                                         placeholder='Add any notes or instructions for this item'
//                                         style={styles.instruction}
//                                         value={field.value}
//                                         onChangeText={field.onChange}
//                                         onBlur={field.onBlur}
//                                         multiline={true}
//                                         numberOfLines={4}
//                                     />
//                                 </View>
//                             )}
//                         />
//                         <View>
//                             {fields.map((attach, index) =>
//                             {
//                                 const currentAttachment = attachmentsWatch?.[index] ?? attach;
//                                 const hasUpload = !!currentAttachment?.imageUrl;

//                                 return (
//                                     <RHFController
//                                         key={attach.uId}
//                                         control={control}
//                                         name={`attachments.${index}`}
//                                         render={({ fieldState }) => (
//                                             <View>
//                                                 {hasUpload ? (
//                                                     <DesignFilePreviewCard
//                                                         imageUrl={currentAttachment.imageUrl ?? ""}
//                                                         imageTypeName={currentAttachment.imageTypeName}
//                                                         cellCount={currentAttachment.cellCount}
//                                                         colorSpace={currentAttachment.colorSpace}
//                                                         documentWidthInMM={currentAttachment.documentWidthInMM}
//                                                         documentHeightInMM={currentAttachment.documentHeightInMM}
//                                                         size={currentAttachment.document?.size}
//                                                         onDelete={() => removeDocument(index, attach.imageTypeId)}
//                                                     />
//                                                 ) : (
//                                                     <DesignFileUpload
//                                                         cellCount={cellCount}
//                                                         finishHeight={dimensions.height}
//                                                         finishWidth={dimensions.width}
//                                                         imageTypeId={attach.imageTypeId}
//                                                         imageTypeName={attach.imageTypeName}
//                                                         name={`attachments.${index}`}
//                                                         previousHeight={currentAttachment?.documentHeightInPx ?? 0}
//                                                         previousWidth={currentAttachment?.documentWidthInPx ?? 0}
//                                                     />
//                                                 )}
//                                                 <Controller
//                                                     control={control}
//                                                     name={`attachments.${index}.document`}
//                                                     render={({ fieldState }) => (
//                                                         <View>
//                                                             {fieldState.error && fieldState.error.message && (
//                                                                 <Text style={[styles.errorText]}>
//                                                                     {fieldState.error.message}
//                                                                 </Text>
//                                                             )}
//                                                         </View>
//                                                     )}
//                                                 />
//                                             </View>
//                                         )}
//                                     />
//                                 )
//                             })}
//                         </View>
//                     </View>
//                 </ScrollView>

//                 <View style={styles.footer}>
//                     <View style={styles.footerLeft}>
//                         <Text style={styles.totalLabel}>Total Amount</Text>
//                         <Text style={styles.totalValue}>Rs {totalAmount.toFixed(2)}</Text>
//                     </View>
//                     <TouchableOpacity
//                         style={[styles.addToCartBtn, formState.isSubmitting && styles.addToCartBtnDisabled]}
//                         disabled={formState.isSubmitting}
//                         onPress={handleSubmit(onSubmitAsync)}
//                     >
//                         {formState.isSubmitting ? (
//                             <ActivityIndicator size="small" color={appTheme.colors.primaryForeground} />
//                         ) : (
//                             <ShoppingCart size={18} color={appTheme.colors.primaryForeground} />
//                         )}
//                         <Text style={styles.addToCartText}>
//                             {formState.isSubmitting ? "Adding…" : "Add to Cart"}
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </FormProvider>
//     );
// }

// export default UploadDesignScreen;
import { api } from '@/lib/api';
import { radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { IconOptionItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Clock, Package, ShoppingCart, Truck } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { Controller, FormProvider, Controller as RHFController, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';
import DesignFilePreviewCard from '../design-file-upload/design-file-preview';
import DesignFileUpload from '../design-file-upload/design-file-upload';
import Input from '../ui/input';
import { defaultValue, formSchema, FormSchemaType } from './config';
import { DesignFileProduct } from './type';

interface UploadDesignScreenProps { }

interface Dimensions
{
    height: number
    width: number
}

const appendFormData = (formData: FormData, key: string, value: any) =>
{
    if (value === undefined || value === null) return;

    // RN picked-file shape -> append as an actual file part
    if (typeof value === "object" && !Array.isArray(value) && "uri" in value && "name" in value)
    {
        formData.append(key, {
            uri: value.uri,
            name: value.name,
            type: value.mimeType || value.type || "application/octet-stream",
        } as any);
        return;
    }

    if (Array.isArray(value))
    {
        value.forEach((item, index) =>
        {
            if (item !== null && typeof item === "object")
            {
                appendFormData(formData, `${key}[${index}]`, item);
            } else
            {
                // repeated same key = how ASP.NET binds List<string>/List<T> from form data
                formData.append(key, String(item));
            }
        });
        return;
    }

    if (typeof value === "object")
    {
        Object.entries(value).forEach(([subKey, subValue]) =>
            appendFormData(formData, `${key}.${subKey}`, subValue)
        );
        return;
    }

    formData.append(key, String(value));
};

const fmtCurrency = (n: number) => `Rs ${n.toFixed(0)}`;

const UploadDesignScreen: FC<UploadDesignScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    const { colors } = appTheme
    const { productId = "", quantityId = "" } = useLocalSearchParams<{ quantityId: string, productId: string }>()
    const [item, setItem] = useState<DesignFileProduct>(defaultValue)
    const [loading, setLoading] = useState<boolean>(false)
    const [dimensions, setDimensions] = useState<Dimensions>({ height: 0, width: 0 })
    const { apiActionAsync } = useApiAction()
    const router = useRouter()
    const inset = useSafeAreaInsets()

    const uploadDesignForm = useForm<FormSchemaType>({
        defaultValues: {
            attachments: [],
            customerId: "",
            id: "",
            imageUrl: "",
            instruction: "",
            otherSpecification: [],
            productId,
            quantityId
        },
        mode: "onChange",
        resolver: zodResolver(formSchema)
    })
    const { control, formState, handleSubmit, setValue } = uploadDesignForm
    const { fields } = useFieldArray({ control, name: "attachments", keyName: "uId" })
    const otherSpecification = useWatch({ control, name: "otherSpecification" });
    const attachmentsWatch = useWatch({ control, name: "attachments" });

    const cellCount = useMemo(
        () => (attachmentsWatch?.length > 0 ? attachmentsWatch[0].cellCount : 1),
        [attachmentsWatch]
    );

    const configItem = useMemo(() =>
    {
        if (item)
        {
            let options: IconOptionItem[] = []
            if (item.quantity.value)
            {
                options = [...options, { icon: Clock, label: "2 to 3 working days", value: "Turnaround" }]
            }

            if (item.turnAroundDays)
            {
                options = [...options, { icon: Package, label: item.quantity.label, value: "Min. Order" }]
            }

            options = [...options, { icon: Truck, label: "Shipping", value: "All over india" }]

            return options;
        }

        return []
    }, [item])

    const additionalPrices = useMemo(() =>
    {
        if (!item.otherSpecifications) return 0;
        return item.otherSpecifications
            .filter((item) => otherSpecification.includes(item.value))
            .reduce((acc, curr) => acc + curr.price * (Math.ceil((item.noOfQuantity * 1) / curr.minQuantity)), 0);
    }, [otherSpecification, item.otherSpecifications]);

    const basePrice = useMemo(
        () => (cellCount == 0 ? 1 : cellCount) * item.price,
        [cellCount, item]
    );

    const totalAmount = useMemo(
        () => basePrice + additionalPrices,
        [basePrice, additionalPrices]
    );

    const removeDocument = useCallback(
        (fieldIndex: number, imageTypeId: string) =>
        {
            const current = attachmentsWatch ?? [];
            setValue(
                "attachments",
                current.map((a, i) =>
                    i === fieldIndex && a.imageTypeId === imageTypeId
                        ? {
                            ...a,
                            document: undefined,
                            isValid: false,
                            cellCount: 0,
                            currentDPI: 0,
                            documentHeightInMM: 0,
                            documentHeightInPx: 0,
                            documentWidthInMM: 0,
                            documentWidthInPx: 0,
                            colorSpace: undefined,
                            imageUrl: "",
                        }
                        : a
                ),
                { shouldValidate: true, shouldDirty: true }
            );
        },
        [attachmentsWatch, setValue]
    );

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            try
            {
                setLoading(false)
                const response = await api.get(`product/getbyid?id=${productId}&quantityId=${quantityId}`)
                if (response.status == 200 && response.data)
                {
                    setItem(response.data)
                    setDimensions({ height: response.data.uploadDimensions.height, width: response.data.uploadDimensions.width })
                    uploadDesignForm.reset({
                        attachments: response.data.attachments,
                        productId,
                        quantityId,
                        customerId: "",
                        instruction: "",
                        imageUrl: "",
                        id: "",
                        otherSpecification: []
                    })
                }

            } catch (error)
            {
                if (error instanceof AxiosError && error.response)
                {
                    await apiActionAsync(error.response)
                }
            }
            finally
            {
                setLoading(true)
            }
        }

        fetchData()
    }, [quantityId, productId])


    const onSubmitAsync = async (payload: FormSchemaType) =>
    {
        try
        {
            const formData = new FormData();
            appendFormData(formData, "Id", "");
            appendFormData(formData, "CustomerId", "");
            appendFormData(formData, "ProductId", payload.productId);
            appendFormData(formData, "QuantityId", payload.quantityId);
            appendFormData(formData, "Instruction", payload.instruction);
            appendFormData(formData, "OtherSpecification", payload.otherSpecification);
            appendFormData(formData, "Attachments", payload.attachments);

            const response = await api.post("cart/create", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.status === 200 && response.data)
            {
                router.navigate("/cart")
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response);
            }
        }
    };

    const styles = useMemo(() => StyleSheet.create({
        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing * 3,
            paddingHorizontal: spacing * 4,
            paddingTop: spacing * 3,
            paddingBottom: spacing * 3,
        },
        backBtn: {
            height: 36,
            width: 36,
            borderRadius: 999,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.foreground,
        },
        headerSubtitle: {
            fontSize: 12,
            color: colors.mutedForeground,
            marginTop: 1,
        },
        container: {
            paddingHorizontal: spacing * 4,
            gap: spacing * 4,
        },
        label: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.foreground,
        },
        sectionHeaderRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
        },
        sectionHeaderRight: {
            fontSize: 12,
            color: colors.mutedForeground,
        },
        instruction: {
            height: 100,
            justifyContent: "flex-start",
            textAlignVertical: 'top',
            padding: spacing * 3,
            fontSize: 14,
        },
        controllerContainer: {
            gap: spacing * 2,
        },
        finishingRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing * 3,
            padding: spacing * 3,
            borderRadius: radius.lg,
            borderWidth: 1,
        },
        finishingRowChecked: {
            borderColor: colors.primary,
            backgroundColor: colors.secondary,
        },
        finishingRowUnchecked: {
            borderColor: colors.border,
            backgroundColor: colors.card,
        },
        checkbox: {
            height: 22,
            width: 22,
            borderRadius: radius.sm,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
        },
        checkboxChecked: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        checkboxUnchecked: {
            borderColor: colors.border,
            backgroundColor: "transparent",
        },
        finishingTextWrap: {
            flex: 1,
            gap: 1,
        },
        finishingLabel: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.foreground,
        },
        finishingDescription: {
            fontSize: 12,
            color: colors.mutedForeground,
        },
        finishingPrice: {
            fontSize: 13,
            fontWeight: "700",
            color: colors.foreground,
        },
        errorText: {
            fontSize: 12,
            color: colors.destructive,
            marginTop: 4,
        },
        screenWrap: {
            flex: 1,
        },
        scrollContent: {
            paddingTop: spacing,
            paddingBottom: 24,
        },
        footer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing * 5,
            paddingTop: spacing * 3,
            paddingBottom: Math.max(inset.bottom, spacing * 3),
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
        },
        footerLeft: {
            gap: 1,
        },
        totalValue: {
            fontSize: 22,
            fontWeight: "800",
            color: colors.cardForeground,
        },
        totalBreakdown: {
            fontSize: 11,
            color: colors.mutedForeground,
        },
        addToCartBtn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing * 2,
            paddingHorizontal: spacing * 5,
            paddingVertical: spacing * 3,
            borderRadius: 999,
            backgroundColor: colors.primary,
        },
        addToCartBtnDisabled: {
            opacity: 0.6,
        },
        addToCartText: {
            color: colors.primaryForeground,
            fontSize: 15,
            fontWeight: "700",
        },
        infoContainer: {
            flexDirection: 'row',
            gap: spacing * 2,
            justifyContent: 'space-evenly'
        },
        infoCard: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing,
            paddingVertical: spacing * 3,
        },
        infoCardTitle: {
            fontWeight: '700',
            fontSize: 12,
            textAlign: "center",
            color: colors.foreground,
        },
        infoCardDescription: {
            fontSize: 11,
            color: colors.mutedForeground
        }
    }), [colors, inset.bottom])

    return (
        <FormProvider {...uploadDesignForm}>
            <View style={[appTheme.styles.screen, styles.screenWrap]}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Artwork & finishing</Text>
                        <Text style={styles.headerSubtitle}>
                            {item.name ? `${item.name}${item.quantity.label ? ` \u00B7 ${item.quantity.label}` : ""}` : "Loading…"}
                        </Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        {configItem.length == 0 ? null : (
                            <View style={[styles.infoContainer]}>
                                {configItem.map((Item, idx) => (
                                    <View key={idx} style={[appTheme.styles.card, styles.infoCard]}>
                                        <Item.icon color={colors.primary} size={18} />
                                        <Text style={[styles.infoCardTitle]}>{Item.label}</Text>
                                        <Text style={[styles.infoCardDescription]}>{Item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View>
                            {fields.map((attach, index) =>
                            {
                                const currentAttachment = attachmentsWatch?.[index] ?? attach;
                                const hasUpload = !!currentAttachment?.imageUrl;

                                return (
                                    <RHFController
                                        key={attach.uId}
                                        control={control}
                                        name={`attachments.${index}`}
                                        render={() => (
                                            <View>
                                                {hasUpload ? (
                                                    <DesignFilePreviewCard
                                                        imageUrl={currentAttachment.imageUrl ?? ""}
                                                        imageTypeName={currentAttachment.imageTypeName}
                                                        fileName={currentAttachment.document?.name}
                                                        cellCount={currentAttachment.cellCount}
                                                        colorSpace={currentAttachment.colorSpace}
                                                        documentWidthInMM={currentAttachment.documentWidthInMM}
                                                        documentHeightInMM={currentAttachment.documentHeightInMM}
                                                        size={currentAttachment.document?.size}
                                                        isValid={currentAttachment.isValid}
                                                        onDelete={() => removeDocument(index, attach.imageTypeId)}
                                                    />
                                                ) : (
                                                    <DesignFileUpload
                                                        cellCount={cellCount}
                                                        finishHeight={dimensions.height}
                                                        finishWidth={dimensions.width}
                                                        imageTypeId={attach.imageTypeId}
                                                        imageTypeName={attach.imageTypeName}
                                                        name={`attachments.${index}`}
                                                        previousHeight={currentAttachment?.documentHeightInPx ?? 0}
                                                        previousWidth={currentAttachment?.documentWidthInPx ?? 0}
                                                    />
                                                )}
                                                <Controller
                                                    control={control}
                                                    name={`attachments.${index}.document`}
                                                    render={({ fieldState }) => (
                                                        <View>
                                                            {fieldState.error && fieldState.error.message && (
                                                                <Text style={[styles.errorText]}>
                                                                    {fieldState.error.message}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    )}
                                                />
                                            </View>
                                        )}
                                    />
                                )
                            })}
                        </View>

                        {item.otherSpecifications.length > 0 && (
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.label}>Finishing</Text>
                                <Text style={styles.sectionHeaderRight}>
                                    optional{additionalPrices > 0 ? ` \u00B7 ${fmtCurrency(additionalPrices)} added` : ""}
                                </Text>
                            </View>
                        )}
                        {item.otherSpecifications.length > 0 && (
                            <RHFController
                                control={control}
                                name='otherSpecification'
                                render={({ field }) => (
                                    <View style={styles.controllerContainer}>
                                        {item.otherSpecifications.map((spec) =>
                                        {
                                            const checked = field.value.includes(spec.value)
                                            const price = spec.price * (Math.ceil((item.noOfQuantity == 0 ? 1 : item.noOfQuantity * 1) / spec.minQuantity))
                                            return (
                                                <Pressable
                                                    key={spec.value}
                                                    onPress={() =>
                                                    {
                                                        if (item.optionType == "f7ba2a38-0191-ab37-c57d-c65e0d95c45c")
                                                        {
                                                            const next = !checked
                                                                ? [...field.value, spec.value]
                                                                : field.value.filter((x) => x !== spec.value);
                                                            field.onChange(next);
                                                        }

                                                        if (item.optionType == "f4d52b0d-a4fa-4dbb-b855-c215ac55e509")
                                                        {
                                                            const next = !checked ? [spec.value] : [];
                                                            field.onChange(next);
                                                        }
                                                    }}
                                                >
                                                    <View
                                                        style={[
                                                            styles.finishingRow,
                                                            checked ? styles.finishingRowChecked : styles.finishingRowUnchecked,
                                                        ]}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.checkbox,
                                                                checked ? styles.checkboxChecked : styles.checkboxUnchecked,
                                                            ]}
                                                        >
                                                            {checked && <Check size={14} color={colors.primaryForeground} />}
                                                        </View>

                                                        <View style={styles.finishingTextWrap}>
                                                            <Text style={styles.finishingLabel}>{spec.label}</Text>
                                                            {/* NOTE: the mock shows a description line per option (e.g.
                                                                "All four corners, 3 mm radius") — otherSpecifications
                                                                doesn't currently carry a description field, so this only
                                                                renders if/when the API starts returning one. */}
                                                            {!!(spec as any).description && (
                                                                <Text style={styles.finishingDescription}>{(spec as any).description}</Text>
                                                            )}
                                                        </View>

                                                        <Text style={styles.finishingPrice}>{fmtCurrency(price)}</Text>
                                                    </View>
                                                </Pressable>
                                            )
                                        })}
                                    </View>
                                )}
                            />
                        )}

                        <Text style={styles.label}>Notes for the press <Text style={styles.sectionHeaderRight}>(optional)</Text></Text>
                        <RHFController
                            control={control}
                            name='instruction'
                            render={({ field }) => (
                                <Input
                                    placeholder='Anything the operator should know — match a previous job, ink notes, delivery timing…'
                                    style={[appTheme.styles.input, styles.instruction]}
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    onBlur={field.onBlur}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            )}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        <Text style={styles.totalValue}>{fmtCurrency(totalAmount)}</Text>
                        <Text style={styles.totalBreakdown}>
                            {fmtCurrency(basePrice)} print{additionalPrices > 0 ? ` + ${fmtCurrency(additionalPrices)} finishing` : ""}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addToCartBtn, formState.isSubmitting && styles.addToCartBtnDisabled]}
                        disabled={formState.isSubmitting}
                        onPress={handleSubmit(onSubmitAsync)}
                    >
                        {formState.isSubmitting ? (
                            <ActivityIndicator size="small" color={colors.primaryForeground} />
                        ) : (
                            <ShoppingCart size={18} color={colors.primaryForeground} />
                        )}
                        <Text style={styles.addToCartText}>
                            {formState.isSubmitting ? "Adding…" : "Add to Cart"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </FormProvider>
    );
}

export default UploadDesignScreen;