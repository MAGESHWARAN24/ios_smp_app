import { radius } from "@/lib/theme";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface PrintGuideOverlayProps
{
    documentWidthInMM: number;
    documentHeightInMM: number;
    bleedInsetMM?: number; // distance from outer edge to the trim line
    safeInsetMM?: number;  // distance from outer edge to the safe-area line
    showBleed?: boolean;
}

export default function PrintGuideOverlay({
    documentWidthInMM,
    documentHeightInMM,
    bleedInsetMM = 2,
    safeInsetMM = 4,
    showBleed = true,
}: PrintGuideOverlayProps)
{
    const appTheme = useThemedStyles();

    const guides = useMemo(() =>
    {
        if (!documentWidthInMM || !documentHeightInMM) return null;

        const trimPctW = (bleedInsetMM / documentWidthInMM) * 100;
        const trimPctH = (bleedInsetMM / documentHeightInMM) * 100;
        const safePctW = (safeInsetMM / documentWidthInMM) * 100;
        const safePctH = (safeInsetMM / documentHeightInMM) * 100;

        return { trimPctW, trimPctH, safePctW, safePctH };
    }, [documentWidthInMM, documentHeightInMM, bleedInsetMM, safeInsetMM]);

    if (!guides) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {showBleed && (
                <View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.guideBox,
                        { borderColor: "#f59e0b", borderStyle: "solid" },
                    ]}
                />
            )}
            <View
                style={[
                    styles.guideBox,
                    {
                        top: `${guides.trimPctH}%`,
                        left: `${guides.trimPctW}%`,
                        right: `${guides.trimPctW}%`,
                        bottom: `${guides.trimPctH}%`,
                        borderColor: appTheme.colors.foreground,
                        borderStyle: "solid",
                    },
                ]}
            />
            <View
                style={[
                    styles.guideBox,
                    {
                        top: `${guides.safePctH}%`,
                        left: `${guides.safePctW}%`,
                        right: `${guides.safePctW}%`,
                        bottom: `${guides.safePctH}%`,
                        borderColor: appTheme.colors.accent,
                        borderStyle: "dashed",
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    guideBox: {
        position: "absolute",
        borderWidth: 1.5
    },
});