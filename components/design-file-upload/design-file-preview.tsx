// import { radius, spacing } from "@/lib/theme";
// import { useThemedStyles } from "@/lib/useThemedStyles";
// import { Trash2 } from "lucide-react-native";
// import { useMemo, useState } from "react";
// import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import DesignFilePreviewModal from "./design-preivew-model";

// interface DesignFilePreviewCardProps
// {
//     imageUrl: string;
//     imageTypeName: string; // e.g. "SINGLE SIDE"
//     cellCount: number;
//     colorSpace?: string;
//     documentWidthInMM: number;
//     documentHeightInMM: number;
//     size?: number; // bytes
//     onDelete: () => void;
// }

// function formatFileSize(bytes?: number): string | null
// {
//     if (!bytes || bytes <= 0) return null;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// export default function DesignFilePreviewCard({
//     imageUrl,
//     imageTypeName,
//     cellCount,
//     colorSpace,
//     documentWidthInMM,
//     documentHeightInMM,
//     size,
//     onDelete,
// }: DesignFilePreviewCardProps)
// {
//     const appTheme = useThemedStyles();
//     const [previewOpen, setPreviewOpen] = useState(false);

//     const aspectRatio = documentWidthInMM && documentHeightInMM
//         ? documentWidthInMM / documentHeightInMM
//         : 1.5;

//     const formattedSize = formatFileSize(size);

//     const styles = useMemo(() => StyleSheet.create({
//         card: {
//             padding: spacing * 3,
//             gap: spacing * 2,
//         },
//         imageWrap: {
//             width: "100%",
//             aspectRatio,
//             borderRadius: radius.lg,
//             overflow: "hidden",
//             backgroundColor: appTheme.colors.muted,
//             borderWidth: 1,
//             borderColor: appTheme.colors.border,
//         },
//         image: {
//             width: "100%",
//             height: "100%",
//         },
//         hintText: {
//             textAlign: "center",
//             fontSize: 11,
//             color: appTheme.colors.accent,
//             fontFamily: appTheme.styles.mutedText.fontFamily,
//         },
//         sideLabel: {
//             textAlign: "center",
//             fontSize: 13,
//             fontFamily: appTheme.styles.title.fontFamily,
//             color: appTheme.colors.cardForeground,
//             letterSpacing: 0.5,
//         },
//         metaRow: {
//             flexDirection: "row",
//             justifyContent: "center",
//             flexWrap: "wrap",
//             gap: spacing * 3,
//         },
//         metaText: {
//             fontSize: 12,
//             color: appTheme.colors.mutedForeground,
//             fontFamily: appTheme.styles.mutedText.fontFamily,
//         },
//         metaLabel: {
//             fontFamily: appTheme.styles.text.fontFamily,
//             color: appTheme.colors.foreground,
//         },
//         removeBtn: {
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: spacing * 1.5,
//             marginTop: spacing,
//         },
//         removeText: {
//             color: appTheme.colors.destructive,
//             fontFamily: appTheme.styles.buttonText.fontFamily,
//             fontSize: 13,
//         },
//     }), [appTheme, aspectRatio]);

//     return (
//         <View style={[appTheme.styles.card, styles.card]}>
//             <TouchableOpacity
//                 style={styles.imageWrap}
//                 activeOpacity={0.85}
//                 onPress={() => setPreviewOpen(true)}
//             >
//                 <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
//             </TouchableOpacity>

//             <Text style={styles.hintText}>Tap the image to preview full size</Text>

//             <Text style={styles.sideLabel}>{imageTypeName}</Text>

//             <View style={styles.metaRow}>
//                 {cellCount > 0 && (
//                     <Text style={styles.metaText}>
//                         Cell count: <Text style={styles.metaLabel}>{cellCount}</Text>
//                     </Text>
//                 )}
//                 {colorSpace && (
//                     <Text style={styles.metaText}>
//                         Color: <Text style={styles.metaLabel}>{colorSpace}</Text>
//                     </Text>
//                 )}
//                 {!!documentWidthInMM && !!documentHeightInMM && (
//                     <Text style={styles.metaText}>
//                         Size: <Text style={styles.metaLabel}>{documentWidthInMM} × {documentHeightInMM} MM</Text>
//                     </Text>
//                 )}
//                 {formattedSize && (
//                     <Text style={styles.metaText}>
//                         File: <Text style={styles.metaLabel}>{formattedSize}</Text>
//                     </Text>
//                 )}
//             </View>

//             <TouchableOpacity style={styles.removeBtn} onPress={onDelete}>
//                 <Trash2 size={15} color={appTheme.colors.destructive} />
//                 <Text style={styles.removeText}>Remove</Text>
//             </TouchableOpacity>

//             <DesignFilePreviewModal
//                 visible={previewOpen}
//                 imageUrl={imageUrl}
//                 documentWidthInMM={documentWidthInMM}
//                 documentHeightInMM={documentHeightInMM}
//                 onClose={() => setPreviewOpen(false)}
//             />
//         </View>
//     );
// }
import { radius, spacing } from "@/lib/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { Check, FileText } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DesignFilePreviewModal from "./design-preivew-model";

interface DesignFilePreviewCardProps
{
    imageUrl: string;
    imageTypeName: string; // e.g. "SINGLE SIDE" / "BACK"
    cellCount: number;
    colorSpace?: string;
    documentWidthInMM: number;
    documentHeightInMM: number;
    fileName?: string;
    size?: number; // bytes
    isValid?: boolean;
    isRequired?: boolean;
    onDelete: () => void;
}

function formatFileSize(bytes?: number): string | null
{
    if (!bytes || bytes <= 0) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DesignFilePreviewCard({
    imageUrl,
    imageTypeName,
    cellCount,
    colorSpace,
    documentWidthInMM,
    documentHeightInMM,
    fileName,
    size,
    isValid = true,
    isRequired = true,
    onDelete,
}: DesignFilePreviewCardProps)
{
    const appTheme = useThemedStyles();
    const { colors } = appTheme;
    const [previewOpen, setPreviewOpen] = useState(false);

    const formattedSize = formatFileSize(size);

    // "1 design · CMYK" line — cellCount doubles as the "N design(s)" count
    // shown in the mock; colorSpace is optional so the separator only shows
    // when both pieces are present.
    const designLine = [
        cellCount > 0 ? `${cellCount} design${cellCount > 1 ? "s" : ""}` : null,
        colorSpace,
    ].filter(Boolean).join(" \u00B7 ");

    const dimensionLine = documentWidthInMM && documentHeightInMM
        ? `${documentWidthInMM} \u00D7 ${documentHeightInMM} MM`
        : null;

    const styles = useMemo(() => StyleSheet.create({
        card: {
            padding: spacing * 4,
            gap: spacing * 3,
        },
        statusRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        statusLabel: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            color: colors.mutedForeground,
        },
        printReadyBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: spacing * 2.5,
            paddingVertical: spacing * 1,
            borderRadius: 999,
            backgroundColor: colors.secondary,
        },
        printReadyText: {
            fontSize: 11,
            fontWeight: "700",
            color: (colors as any).linkText ?? colors.primary,
        },
        notPrintReadyBadge: {
            paddingHorizontal: spacing * 2.5,
            paddingVertical: spacing * 1,
            borderRadius: 999,
            backgroundColor: colors.destructive + "1a",
        },
        notPrintReadyText: {
            fontSize: 11,
            fontWeight: "700",
            color: colors.destructive,
        },
        fileRow: {
            flexDirection: "row",
            gap: spacing * 3,
            alignItems: "center",
        },
        thumbWrap: {
            width: 60,
            height: 60,
            borderRadius: radius.sm,
            overflow: "hidden",
            backgroundColor: colors.muted,
            borderWidth: 1,
            borderColor: colors.border,
        },
        thumbImage: {
            width: "100%",
            height: "100%",
        },
        fileInfo: {
            flex: 1,
            gap: 2,
        },
        fileName: {
            fontSize: 14,
            fontWeight: "700",
            color: colors.cardForeground,
        },
        fileMeta: {
            fontSize: 12,
            color: colors.mutedForeground,
        },
        actionsRow: {
            flexDirection: "row",
            gap: spacing * 4,
        },
        actionLink: {
            fontSize: 12,
            fontWeight: "600",
            color: (colors as any).linkText ?? colors.primary,
        },
        removeLink: {
            fontSize: 12,
            fontWeight: "600",
            color: colors.destructive,
        },
    }), [colors]);

    return (
        <View style={[appTheme.styles.card, styles.card]}>
            <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                    {imageTypeName}{isRequired ? " \u00B7 REQUIRED" : ""}
                </Text>
                {isValid ? (
                    <View style={styles.printReadyBadge}>
                        <Check size={12} color={(colors as any).linkText ?? colors.primary} />
                        <Text style={styles.printReadyText}>PRINT READY</Text>
                    </View>
                ) : (
                    <View style={styles.notPrintReadyBadge}>
                        <Text style={styles.notPrintReadyText}>NEEDS ATTENTION</Text>
                    </View>
                )}
            </View>

            <View style={styles.fileRow}>
                <TouchableOpacity
                    style={styles.thumbWrap}
                    activeOpacity={0.85}
                    onPress={() => setPreviewOpen(true)}
                >
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.thumbImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.thumbImage, { alignItems: "center", justifyContent: "center" }]}>
                            <FileText size={20} color={colors.mutedForeground} />
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.fileInfo}>
                    {!!fileName && <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>}
                    {!!designLine && <Text style={styles.fileMeta}>{designLine}</Text>}
                    {!!dimensionLine && (
                        <Text style={styles.fileMeta}>
                            {dimensionLine}
                            {formattedSize ? ` \u00B7 ${formattedSize}` : ""}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => setPreviewOpen(true)}>
                    <Text style={styles.actionLink}>Preview full size</Text>
                </TouchableOpacity>
                {/* Replace re-opens the picker for this slot — same handler as
                    a fresh upload, since setting a new attachments value
                    overwrites the current one. */}
                <TouchableOpacity onPress={onDelete}>
                    <Text style={styles.actionLink}>Replace</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete}>
                    <Text style={styles.removeLink}>Remove</Text>
                </TouchableOpacity>
            </View>

            <DesignFilePreviewModal
                visible={previewOpen}
                imageUrl={imageUrl}
                documentWidthInMM={documentWidthInMM}
                documentHeightInMM={documentHeightInMM}
                onClose={() => setPreviewOpen(false)}
            />
        </View>
    );
}