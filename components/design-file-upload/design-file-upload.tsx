import { useThemedStyles } from "@/lib/useThemedStyles";
import * as DocumentPicker from "expo-document-picker";
import { Upload } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import
{
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import type z from "zod";
import
{
    ACCEPTED_TYPES,
    designFileSchema,
    MAX_FILES,
    MAX_SIZE,
    ValidateDPISeverSideAsync,
    type DPIResponse
} from "./config";

export type PickedFile = {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
};

interface DesignFileUploadProps
{
    finishHeight: number;
    finishWidth: number;
    imageTypeId: string;
    name: string;
    imageTypeName: string;
    cellCount: number;
    previousHeight?: number;
    previousWidth?: number;
    maxFiles?: number;
    maxSize?: number;
    accept?: string[];
}

export default function DesignFileUpload({
    name,
    finishHeight,
    finishWidth,
    imageTypeId,
    imageTypeName,
    maxFiles = MAX_FILES,
    maxSize = MAX_SIZE,
    accept = ACCEPTED_TYPES,
    previousHeight = 53,
    previousWidth = 90,
    cellCount = 0,
}: DesignFileUploadProps)
{
    const { control, setError, clearErrors, setValue } = useFormContext();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const isProcessing = useRef(false);
    const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const appTheme = useThemedStyles()
    const startProgress = () =>
    {
        setProgress(0);
        progressTimer.current = setInterval(() =>
        {
            setProgress((prev) =>
            {
                if (prev >= 85)
                {
                    if (progressTimer.current) clearInterval(progressTimer.current);
                    return 85;
                }
                return prev + 10;
            });
        }, 180);
    };

    const stopProgress = () =>
    {
        if (progressTimer.current)
        {
            clearInterval(progressTimer.current);
            progressTimer.current = null;
        }
    };

    const buildDesignFileData = (
        file: PickedFile,
        response: DPIResponse,
        isValidOverride?: boolean
    ): z.infer<typeof designFileSchema> => ({
        cellCount: response.cellCount,
        documentHeightInMM: response.documentHeightInMM,
        documentHeightInPx: response.documentHeightInPx,
        documentWidthInMM: response.documentWidthInMM,
        documentWidthInPx: response.documentWidthInPx,
        document: file as unknown as PickedFile,
        imageTypeId,
        imageTypeName,
        isValid: isValidOverride ?? response.isValid,
        currentDPI: response.currentDPI,
        extraChannels: response.extraChannels,
        totalChannels: response.totalChannels,
        colorSpace: response.colorSpace,
        imageUrl: response.imageUrl,
    });

    const handlePickFiles = async () =>
    {
        if (isProcessing.current || loading) return;

        const result = await DocumentPicker.getDocumentAsync({
            type: accept.length ? accept : "*/*",
            multiple: maxFiles > 1,
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const assets = result.assets ?? [];
        if (!assets.length) return;

        if (maxSize)
        {
            const tooLarge = assets.find((a) => (a.size ?? 0) > maxSize);
            if (tooLarge)
            {
                setError(name, { message: `"${tooLarge.name}" exceeds the maximum file size.` });
                return;
            }
        }

        const picked: PickedFile[] = assets.map((a) => ({
            uri: a.uri,
            name: a.name,
            type: a.mimeType,
            size: a.size,
        }));

        await handleValueChange(picked);
    };

    const handleValueChange = async (files: PickedFile[]) =>
    {
        if (isProcessing.current) return;
        isProcessing.current = true;
        setLoading(true);
        startProgress();

        try
        {
            const response = await ValidateDPISeverSideAsync(
                files,
                finishHeight,
                finishWidth,
                cellCount,
                previousHeight,
                previousWidth
            );
            stopProgress();
            setProgress(100);


            if (response && !response.isValid)
            {
                if (response.message.includes("Only CMYK color space files are accepted"))
                {
                    Alert.alert(
                        "File Format Warning",
                        response.message,
                        [
                            {
                                text: "Cancel",
                                style: "cancel",
                                onPress: () => { }
                            },
                            {
                                text: "Proceed",
                                style: "default",
                                onPress: () => setValue(name, buildDesignFileData(files[0], response))
                            }
                        ])
                    return;
                } else
                {
                    setError(`${name}.document`, {
                        message: response.message,
                    });
                }
            } else
            {
                setValue(name, buildDesignFileData(files[0], response));
                clearErrors(name);
            }
        } catch (err)
        {
            stopProgress();
            setError(`${name}.document`, { message: "Validation failed. Please try again." });
        } finally
        {
            setTimeout(() =>
            {
                setLoading(false);
                setProgress(0);
                isProcessing.current = false;
            }, 400);
        }
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            width: "100%",
            gap: 6,
        },
        label: {
            fontSize: 13,
            fontWeight: "500",
            color: "#111827",
        },
        required: {
            color: appTheme.colors.destructive,
        },
        dropzone: {
            height: 160,
            width: "100%",
            borderWidth: 1,
            borderStyle: "dashed",
            backgroundColor: appTheme.colors.card,
            borderColor: appTheme.colors.input,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            paddingHorizontal: 12,
        },
        dropzoneDisabled: {
            opacity: 0.7,
        },
        iconCircle: {
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 999,
            padding: 10,
        },
        dropzoneTitle: {
            fontSize: 12,
            fontWeight: "600",
            color: "#111827",
        },
        dropzoneSubtitle: {
            fontSize: 11,
            color: "#6b7280",
            textAlign: "center",
        },
        browseButton: {
            marginTop: 8,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        browseButtonText: {
            fontSize: 12,
            color: "#111827",
        },
        progressWrap: {
            marginTop: 4,
            width: "80%",
            gap: 6,
            alignItems: "center",
        },
        progressLabel: {
            fontSize: 11,
            color: "#6b7280",
        },
        progressTrack: {
            height: 8,
            width: "100%",
            borderRadius: 999,
            backgroundColor: "#e5e7eb",
            overflow: "hidden",
        },
        progressFill: {
            height: "100%",
            backgroundColor: appTheme.colors.primary,
            borderRadius: 999,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        },
        modalCard: {
            width: "100%",
            maxWidth: 420,
            backgroundColor: appTheme.colors.card,
            borderRadius: 12,
            padding: 20,
            gap: 12,
        },
        modalTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: "#111827",
        },
        modalDescription: {
            fontSize: 13,
            color: "#374151",
        },
        modalFooter: {
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 8,
        },
        modalButton: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 6,
        },
        destructiveButton: {
            backgroundColor: appTheme.colors.destructive,
        },
        destructiveButtonText: {
            color: appTheme.colors.card,
            fontSize: 13,
            fontWeight: "600",
        },
        primaryButton: {
            backgroundColor: "#111827",
        },
        primaryButtonText: {
            color: appTheme.colors.card,
            fontSize: 13,
            fontWeight: "600",
        },
    }), [appTheme])

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {imageTypeName} <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
                style={[styles.dropzone, loading && styles.dropzoneDisabled]}
                activeOpacity={0.7}
                disabled={loading}
                onPress={handlePickFiles}
            >
                <View style={styles.iconCircle}>
                    {loading ? (
                        <ActivityIndicator size="small" color={appTheme.colors.primary} />
                    ) : (
                        <Upload size={20} color={appTheme.colors.primary} />
                    )}
                </View>

                {loading ? (
                    <View style={styles.progressWrap}>
                        <Text style={styles.progressLabel}>Validating file… {progress}%</Text>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={styles.dropzoneTitle}>Tap to select a file</Text>
                        <Text style={styles.dropzoneSubtitle}>
                            {accept.join(", ") || "Any file type"}
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            disabled={loading}
                            onPress={handlePickFiles}
                        >
                            <Text style={styles.browseButtonText}>Browse files</Text>
                        </TouchableOpacity>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

