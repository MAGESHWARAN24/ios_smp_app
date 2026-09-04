import { api } from '@/lib/api';
import { radius } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Filter, IconOptionItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Clock, Package, Truck } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';
import { useAuth } from '../auth/config';
import { CartFormSchemaType, defaultAvailableOptions, defaultCartFormValue, FACET_DEFINITIONS, formSchema, itemPriceDefaultValue } from './config';
import ConfigOptionItem from './config-option-item';
import Footer from './footer';
import { AvailableOptions, ItemPrice, OptionVisibility, ProductCombination, ProductConfigOptions, SelectableFieldKey } from './type';

interface ContentProps
{
    options: ProductConfigOptions
}

let count = 0;

interface Dimension { height: number; width: number }

const Content: FC<ContentProps> = ({ options }) =>
{
    const appTheme = useThemedStyles()
    const productId = options.id;
    const { isAuthenticated } = useAuth()
    const { apiActionAsync } = useApiAction()
    const [quantity, setQuantity] = useState<number>(0)
    const [price, setPrice] = useState<ItemPrice>(itemPriceDefaultValue)
    const [loading, setLoading] = useState<boolean>(false)
    const [finishSize, setFinishSize] = useState<Dimension>({ height: 0, width: 0 })
    const cartForm = useForm<CartFormSchemaType>({
        defaultValues: defaultCartFormValue,
        mode: "onChange",
        resolver: zodResolver(formSchema),
        disabled: loading
    })
    const [availableOptions, setAvailableOptions] = useState<AvailableOptions>(defaultAvailableOptions)
    const [selectionTick, setSelectionTick] = useState(0)
    const userTouchedFields = useRef<Set<SelectableFieldKey>>(new Set())
    const lastProcessedTick = useRef(0)
    const latestValues = useRef<Partial<Record<SelectableFieldKey, string | undefined>>>({})
    const abortRef = useRef<AbortController | null>(null)
    const priceItem = useMemo(() =>
    {
        if (price.isValid)
        {
            let options: IconOptionItem[] = []
            if (price.minQuantity)
            {
                options = [...options, { icon: Clock, label: "2 to 3 working days", value: "Turnaround" }]
            }

            if (price.turnAroundDays)
            {
                options = [...options, { icon: Package, label: price.minQuantity, value: "Min. Order" }]
            }

            options = [...options, { icon: Truck, label: "Shipping", value: "All over india" }]

            return options;
        }

        return []
    }, [price])
    const { control, formState, handleSubmit, reset, setValue, getValues } = cartForm
    const updateConfiguration = useCallback((
        productConfig: ProductCombination,
        visibility?: OptionVisibility
    ) =>
    {
        const vis = visibility ?? getValues("optionVisibility")

        const autoSelect = (
            fieldKey: SelectableFieldKey,
            options: Array<{ value: string }>,
            isVisible: boolean,
            onSelect?: (value: string) => void
        ) =>
        {
            if (!isVisible) return

            if (options.length === 1 && !userTouchedFields.current.has(fieldKey))
            {
                setValue(fieldKey, options[0].value)
                onSelect?.(options[0].value)
            }
            if (options.length === 0)
            {
                setValue(fieldKey, "")
                userTouchedFields.current.delete(fieldKey)
                onSelect?.("")
            }
        }
        autoSelect("mediaId", productConfig.media, vis.isMedia)
        autoSelect("gsmId", productConfig.gsm, vis.isGsm)
        autoSelect("laminationId", productConfig.lamination, vis.isLamination)
        autoSelect("fileFinishingId", productConfig.fileFinishing, vis.isFileFinishing)
        autoSelect("printingSideId", productConfig.printingSide, vis.isPrintingSide)
        autoSelect("finishSizeId", productConfig.finishSize, vis.isFinishSize, (val) =>
        {
            if (val)
            {
                // const item = productConfig.finishSize.find(x => x.value === val)
                // if (item) setFinishSize({ height: item.height, width: item.width })
            } else
            {
                // setFinishSize({ height: 0, width: 0 })
            }
        })
        autoSelect("quantityId", productConfig.quantity, vis.isQuantity)
        autoSelect("pouchId", productConfig.pouch, vis.isPouch)
        autoSelect("foilTypeId", productConfig.foilType, vis.isFoilType)
        autoSelect("foilSideId", productConfig.foilSide, vis.isFoilSide)
        autoSelect("spotUVId", productConfig.spotUV, vis.isSpotUV)
        autoSelect("coverTypeId", productConfig.coverType, vis.isCoverType)
        autoSelect("padId", productConfig.pad, vis.isPad)
        autoSelect("dieCutId", productConfig.dieCut, vis.isDiecut)
        if (productConfig.uploadDimensions.length === 1)
        {
            setValue("productUploadFileDimensionsId", productConfig.uploadDimensions[0].value)
            setFinishSize({ height: productConfig.uploadDimensions[0].height, width: productConfig.uploadDimensions[0].width })
        } else
        {
            setValue("productUploadFileDimensionsId", "")
            setFinishSize({ height: 0, width: 0 })
        }

    }, [setValue, getValues])

    const markTouched = useCallback((fieldKey: SelectableFieldKey) =>
    {
        userTouchedFields.current.add(fieldKey)
        setSelectionTick((t) => t + 1)
    }, [])

    const mediaId = useWatch({ control, name: "mediaId" })
    const gsmId = useWatch({ control, name: "gsmId" })
    const laminationId = useWatch({ control, name: "laminationId" })
    const printingSideId = useWatch({ control, name: "printingSideId" })
    const finishSizeId = useWatch({ control, name: "finishSizeId" })
    const coverTypeId = useWatch({ control, name: "coverTypeId" })
    const attachments = useWatch({ control, name: "attachments" })
    const quantityId = useWatch({ control, name: "quantityId" })
    const foilSideId = useWatch({ control, name: "foilSideId" })
    const foilTypeId = useWatch({ control, name: "foilTypeId" })
    const spotUVId = useWatch({ control, name: "spotUVId" })
    const pouchId = useWatch({ control, name: "pouchId" })
    const padId = useWatch({ control, name: "padId" })
    const dieCutId = useWatch({ control, name: "dieCutId" })
    const fileFinishingId = useWatch({ control, name: "fileFinishingId" })

    latestValues.current = {
        mediaId, gsmId, laminationId, printingSideId, finishSizeId, quantityId,
        foilSideId, foilTypeId, spotUVId, padId, dieCutId, pouchId, coverTypeId, fileFinishingId,
    }

    const buildFilterEntries = useCallback((
        vis: OptionVisibility,
        values: Partial<Record<SelectableFieldKey, string | undefined>>,
        excludeKey?: SelectableFieldKey
    ): Filter[] =>
    {
        const entries: Filter[] = FACET_DEFINITIONS
            .filter(({ fieldKey, visibilityKey }) =>
                vis[visibilityKey] &&
                fieldKey !== excludeKey &&
                Boolean(values[fieldKey])
            )
            .map(({ fieldKey, propertyName }) => ({
                id: propertyName,
                value: {
                    alias: "productquantity_ibfk_1",
                    dataType: "numeric",
                    logic: "AND",
                    matchCase: "=",
                    value: values[fieldKey],
                },
            }))

        entries.push({
            id: "productId",
            value: {
                alias: "productquantity_ibfk_1",
                dataType: "numeric",
                logic: "AND",
                matchCase: "=",
                value: productId,
            },
        })

        return entries
    }, [productId])

    useEffect(() =>
    {
        const visibility = options.optionVisibility
        if (!visibility) return

        const visibleFieldMap: Array<{ visible: boolean; value: string | undefined }> = [
            { visible: visibility.isMedia, value: mediaId },
            { visible: visibility.isGsm, value: gsmId },
            { visible: visibility.isLamination, value: laminationId },
            { visible: visibility.isPrintingSide, value: printingSideId },
            { visible: visibility.isFinishSize, value: finishSizeId },
            { visible: visibility.isCoverType, value: coverTypeId },
            { visible: visibility.isQuantity, value: quantityId },
            { visible: visibility.isFoilType, value: foilTypeId },
            { visible: visibility.isFoilSide, value: foilSideId },
            { visible: visibility.isSpotUV, value: spotUVId },
            { visible: visibility.isPad, value: padId },
            { visible: visibility.isDiecut, value: dieCutId },
            { visible: visibility.isPouch, value: pouchId },
            { visible: visibility.isFileFinishing, value: fileFinishingId },
        ]

        const visibleFields = visibleFieldMap.filter((f) => f.visible)
        const allUnselected = visibleFields.length > 0 && visibleFields.every((f) => !f.value)

        // Nothing to clear — skip to avoid redundant setValue churn/re-renders.
        if (!allUnselected) return
        if (userTouchedFields.current.size === 0 && !getValues("productQuantityId")) return

        const fieldsToClear: SelectableFieldKey[] = [
            "mediaId", "gsmId", "laminationId", "fileFinishingId",
            "printingSideId", "finishSizeId", "quantityId", "pouchId",
            "foilTypeId", "foilSideId", "spotUVId", "coverTypeId",
            "padId", "dieCutId"
        ]
        fieldsToClear.forEach((key) => setValue(key, ""))
        setValue("productQuantityId", "")
        setValue("productUploadFileDimensionsId", "")
        setFinishSize({ height: 0, width: 0 })
        setPrice(itemPriceDefaultValue)
        userTouchedFields.current.clear()
    }, [
        mediaId, gsmId, laminationId, printingSideId, finishSizeId,
        coverTypeId, quantityId, foilTypeId, foilSideId, spotUVId,
        padId, dieCutId, pouchId, fileFinishingId,
        options.optionVisibility, setValue, getValues
    ])

    useEffect(() =>
    {
        if (!productId || !options) return

        if (selectionTick === lastProcessedTick.current) return
        lastProcessedTick.current = selectionTick

        const vis = options.optionVisibility
        const values = latestValues.current

        // Cancel any still-in-flight request from a previous selection.
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller;

        // startTransition(async () =>
        (async () =>
        {
            try
            {
                setLoading(true)
                // ── 1) FULL filter → resolves the matched product / price / attachments ──
                const fullFilters = buildFilterEntries(vis, values)
                const fullResponse = await api.post(
                    `product/configuration?productId=${productId}`,
                    fullFilters,
                    { signal: controller.signal }
                )

                if (!(fullResponse.status === 200 && fullResponse.data)) return

                const fullConfig: ProductCombination = fullResponse.data

                if (fullConfig.product.length === 1)
                {
                    setPrice({
                        isValid: true,
                        basePrice: fullConfig.product[0].basePrice,
                        description: fullConfig.product[0]?.description,
                        id: fullConfig.product[0].id,
                        price: fullConfig.product[0].price,
                        helperLink: fullConfig.product[0].helperLink,
                        helperText: fullConfig.product[0].helperText,
                        turnAroundDays: fullConfig.product[0].turnAroundDays,
                        quantity: {
                            label: fullConfig.product[0].minQuantity as string,
                            value: ""
                        },
                        shortDescription: fullConfig.product[0].shortDescription,
                        minQuantity: fullConfig.product[0].minQuantity
                    })
                    setQuantity(fullConfig.quantity[0]?.quantity ?? 0)
                    setValue("productQuantityId", fullConfig.product[0].id)
                } else
                {
                    setPrice(itemPriceDefaultValue)
                    setValue("productQuantityId", "")
                    setQuantity(0)
                }

                setValue("productId", productId)
                setValue("attachments", fullConfig.attachments)

                // ── 2) PER-FACET filters (self-excluded) → each facet's own sibling list ──
                // OPTIMIZATION (this is the fix for "multiple API hits per click"):
                //
                // buildFilterEntries() already skips any facet whose current value is
                // falsy. That means for a facet the user hasn't selected yet, the FULL
                // filter call above never included that facet's own filter anyway —
                // so `fullConfig[resultKey]` IS ALREADY the self-excluded result for
                // that facet. Re-querying it is a wasted, duplicate network call.
                //
                // We only need a genuinely fresh, self-excluded query for a facet that
                // currently HAS a selected value, since excluding that facet's own
                // filter changes the query compared to the full one.
                //
                // Net effect: on a product where nothing is selected yet, a click now
                // costs exactly 1 request instead of (1 + number of visible facets).
                // As the user makes more selections, only the facets they've actually
                // picked need their own follow-up request — everything else is reused.
                const visibleFacets = FACET_DEFINITIONS.filter(({ visibilityKey }) => vis[visibilityKey])

                const facetsNeedingOwnQuery = visibleFacets.filter(({ fieldKey }) => Boolean(values[fieldKey]))
                const facetsReusingFullConfig = visibleFacets.filter(({ fieldKey }) => !values[fieldKey])

                const facetResults = facetsNeedingOwnQuery.length > 0
                    ? await Promise.all(
                        facetsNeedingOwnQuery.map(async ({ fieldKey, resultKey }) =>
                        {
                            const filters = buildFilterEntries(vis, values, fieldKey)
                            const res = await api.post(
                                `product/configuration?productId=${productId}`,
                                filters,
                                { signal: controller.signal }
                            )
                            const list = (res.data?.[resultKey] ?? []) as Array<{ value: string }>
                            return { resultKey, list }
                        })
                    )
                    : []

                const nextAvailable: AvailableOptions = defaultAvailableOptions

                // Facets with no current selection: reuse the list already present
                // in the full-filter response — no extra request needed.
                facetsReusingFullConfig.forEach(({ resultKey }) =>
                {
                    const list = (fullConfig[resultKey] ?? []) as Array<{ value: string }>
                    nextAvailable[resultKey] = list.map((x) => x.value)
                })

                facetResults.forEach(({ resultKey, list }) =>
                {
                    nextAvailable[resultKey] = list.map((x) => x.value)
                })

                setAvailableOptions(nextAvailable)

                // Auto-select / auto-clear logic still uses the FULL config. Its
                // internal setValue calls do NOT appear in this effect's deps
                // (selectionTick/productId/product only), so they cannot cause
                // another run of this effect.
                updateConfiguration(fullConfig, vis)
            } catch (error)
            {
                if (error instanceof AxiosError && error.code === "ERR_CANCELED")
                {
                    return
                }
                if (error instanceof AxiosError && error.response)
                {
                    await apiActionAsync(error.response)
                }
            }
            finally
            {
                setLoading(false)
            }
        })()
    }, [
        productId,
        selectionTick,
        options
    ])

    useEffect(() =>
    {
        reset(defaultCartFormValue)
        setAvailableOptions(defaultAvailableOptions)
        setPrice(itemPriceDefaultValue)
        setFinishSize({ height: 0, width: 0 })
        setQuantity(0)
        userTouchedFields.current.clear()
        lastProcessedTick.current = -1
        setSelectionTick(0)

        abortRef.current?.abort()
    }, [productId, reset])

    const styles = useMemo(() => StyleSheet.create({
        container: {
            backgroundColor: appTheme.colors.background,
            paddingHorizontal: 8,
            gap: 8,
            paddingVertical: 6
        },
        image: {
            height: 280,
            width: 'auto',
            borderRadius: radius.xl
        },
        category: {
            flexDirection: 'row',
            gap: 5,
        },
        description: {
            fontSize: 15
        },
        title: {
            fontSize: 20,
            fontWeight: "bold"
        },
        badge: {
            backgroundColor: appTheme.colors.primary,
            color: appTheme.colors.background,
            fontWeight: "bold",
            height: 25,
            width: 'auto',
            textAlignVertical: "auto"
        },
        infoContainer: {
            flex: 3,
            flexDirection: 'row',
            paddingVertical: 10,
            gap: 10,
            justifyContent: 'space-evenly'
        },
        infoCard: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 5
        },
        infoCardTitle: {
            fontWeight: 'bold',
            textAlign: "center",
        },
        infoCardDescription: {
            color: appTheme.colors.mutedForeground
        }
    }), [appTheme.colors])

    return (
        <FormProvider {...cartForm}>
            <ScrollView>
                <View style={[styles.container]}>
                    <Image
                        source={{ uri: options.productImage.label }}
                        style={[styles.image]}
                        resizeMode='cover'
                    />
                    <Text style={[styles.title]}>
                        {options.name}
                    </Text>
                    <Text style={[styles.description]} numberOfLines={3}>
                        {options.mobileDescription}
                    </Text>
                    <View style={[styles.category]}>
                        <Text style={[appTheme.styles.badge, styles.badge]}>
                            {options.producType.label}
                        </Text>
                        <Text style={[appTheme.styles.badge, styles.badge]}>
                            {options.classification.label}
                        </Text>
                    </View>
                    {priceItem.length == 0 ? null : (
                        <View style={[styles.infoContainer]}>
                            {priceItem.map((Item, idx) => (
                                <View key={idx} style={[appTheme.styles.card, styles.infoCard]}>
                                    <Item.icon color={appTheme.colors.primary} />
                                    <Text style={[styles.infoCardTitle]}>{Item.label}</Text>
                                    <Text style={[styles.infoCardDescription]}>{Item.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                {options.optionVisibility.isDiecut && options.dieCut.length > 0 && (
                    <ConfigOptionItem
                        name='dieCutId'
                        label='Die Cut'
                        availableOptions={availableOptions.dieCut}
                        markTouched={markTouched}
                        options={options.dieCut}
                        renderItem='image'
                    />
                )}
                {options.optionVisibility.isGsm && options.gsm.length > 0 && (
                    <ConfigOptionItem
                        name='gsmId'
                        label='Gsm'
                        availableOptions={availableOptions.gsm}
                        markTouched={markTouched}
                        options={options.gsm}
                    />
                )}
                {options.optionVisibility.isMedia && options.media.length > 0 && (
                    <ConfigOptionItem
                        name='mediaId'
                        label='Media'
                        availableOptions={availableOptions.media}
                        markTouched={markTouched}
                        options={options.media}
                    />
                )}
                {options.optionVisibility.isLamination && options.lamination.length > 0 && (
                    <ConfigOptionItem
                        name='laminationId'
                        label='Lamination'
                        availableOptions={availableOptions.lamination}
                        markTouched={markTouched}
                        options={options.lamination}
                    />
                )}
                {options.optionVisibility.isFileFinishing && options.fileFinishing.length > 0 && (
                    <ConfigOptionItem
                        name='fileFinishingId'
                        label='File Finishing'
                        availableOptions={availableOptions.fileFinishing}
                        markTouched={markTouched}
                        options={options.fileFinishing}
                    />
                )}
                {options.optionVisibility.isPrintingSide && options.printingSide.length > 0 && (
                    <ConfigOptionItem
                        name='printingSideId'
                        label='Printing Side'
                        availableOptions={availableOptions.printingSide}
                        markTouched={markTouched}
                        options={options.printingSide}
                    />
                )}
                {options.optionVisibility.isFinishSize && options.finishSize.length > 0 && (
                    <ConfigOptionItem
                        name='finishSizeId'
                        label='Size'
                        availableOptions={availableOptions.finishSize}
                        markTouched={markTouched}
                        options={options.finishSize}
                    />
                )}
                {options.optionVisibility.isQuantity && options.quantity.length > 0 && (
                    <ConfigOptionItem
                        name='quantityId'
                        label='Quantity'
                        availableOptions={availableOptions.quantity}
                        markTouched={markTouched}
                        options={options.quantity}
                    />
                )}
                {options.optionVisibility.isPouch && options.pouch.length > 0 && (
                    <ConfigOptionItem
                        name='pouchId'
                        label='Pouch'
                        availableOptions={availableOptions.pouch}
                        markTouched={markTouched}
                        options={options.pouch}
                    />
                )}
                {options.optionVisibility.isFoilType && options.foilType.length > 0 && (
                    <ConfigOptionItem
                        name='foilTypeId'
                        label='Foil Type'
                        availableOptions={availableOptions.foilType}
                        markTouched={markTouched}
                        options={options.foilType}
                    />
                )}
                {options.optionVisibility.isFoilSide && options.foilSide.length > 0 && (
                    <ConfigOptionItem
                        name='foilSideId'
                        label='Foil Side'
                        availableOptions={availableOptions.foilSide}
                        markTouched={markTouched}
                        options={options.foilSide}
                    />
                )}
                {options.optionVisibility.isSpotUV && options.spotUV.length > 0 && (
                    <ConfigOptionItem
                        name='spotUVId'
                        label='Spot UV'
                        availableOptions={availableOptions.spotUV}
                        markTouched={markTouched}
                        options={options.spotUV}
                    />
                )}
                {options.optionVisibility.isCoverType && options.coverType.length > 0 && (
                    <ConfigOptionItem
                        name='coverTypeId'
                        label='Cover Type'
                        availableOptions={availableOptions.coverType}
                        markTouched={markTouched}
                        options={options.coverType}
                    />
                )}
                {options.optionVisibility.isPad && options.pad.length > 0 && (
                    <ConfigOptionItem
                        name='padId'
                        label='Pad'
                        availableOptions={availableOptions.pad}
                        markTouched={markTouched}
                        options={options.pad}
                    />
                )}
            </ScrollView>
            <Footer productId={productId} item={price} />
        </FormProvider>
    );
}

export default Content;
