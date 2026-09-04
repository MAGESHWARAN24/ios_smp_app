import { spacing } from "@/lib/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Dimensions, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PrintGuideOverlay from "./printing-guide-overlay";

interface DesignFilePreviewModalProps
{
    visible: boolean;
    imageUrl: string;
    documentWidthInMM: number;
    documentHeightInMM: number;
    onClose: () => void;
}

export default function DesignFilePreviewModal({
    visible,
    imageUrl,
    documentWidthInMM,
    documentHeightInMM,
    onClose,
}: DesignFilePreviewModalProps)
{
    const appTheme = useThemedStyles();
    const [showGuides, setShowGuides] = useState(true);

    const screenWidth = Dimensions.get("window").width;
    const maxWidth = screenWidth - spacing * 10;
    const aspectRatio = documentWidthInMM && documentHeightInMM
        ? documentWidthInMM / documentHeightInMM
        : 1;

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing * 5,
        },
        header: {
            position: "absolute",
            top: spacing * 12,
            left: spacing * 5,
            right: spacing * 5,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        closeBtn: {
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.12)",
            alignItems: "center",
            justifyContent: "center",
        },
        toggleBtn: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing * 1.5,
            paddingHorizontal: spacing * 3,
            paddingVertical: spacing * 1.5,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.12)",
        },
        toggleText: {
            color: "#ffffff",
            fontFamily: appTheme.styles.text.fontFamily,
            fontSize: 12,
        },
        imageWrap: {
            width: maxWidth,
            aspectRatio,
            backgroundColor: "#ffffff",
            borderRadius: 4,
            overflow: "hidden",
        },
        image: {
            width: "100%",
            height: "100%",
        },
        legend: {
            position: "absolute",
            bottom: spacing * 10,
            flexDirection: "row",
            gap: spacing * 5,
        },
        legendItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: spacing * 1.5,
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 2,
        },
        legendText: {
            color: "#e5e7eb",
            fontSize: 11,
            fontFamily: appTheme.styles.mutedText.fontFamily,
        },
    }), [appTheme, maxWidth, aspectRatio]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.toggleBtn}
                        onPress={(e) => { e.stopPropagation(); setShowGuides((v) => !v); }}
                    >
                        <Text style={styles.toggleText}>
                            {showGuides ? "Hide print guides" : "Show print guides"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <X size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                <Pressable onPress={(e) => e.stopPropagation()} style={styles.imageWrap}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                    {showGuides && (
                        <PrintGuideOverlay
                            documentWidthInMM={documentWidthInMM}
                            documentHeightInMM={documentHeightInMM}
                        />
                    )}
                </Pressable>

                {showGuides && (
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
                            <Text style={styles.legendText}>Bleed</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: appTheme.colors.foreground }]} />
                            <Text style={styles.legendText}>Trim</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: appTheme.colors.accent }]} />
                            <Text style={styles.legendText}>Safe area</Text>
                        </View>
                    </View>
                )}
            </Pressable>
        </Modal>
    );
}