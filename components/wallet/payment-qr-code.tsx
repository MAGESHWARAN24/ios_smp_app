import { useThemedStyles } from "@/lib/useThemedStyles";
import React from "react";
import { Image, Text, View } from "react-native";

// Static web import `import QRCode from "@/assets/QRCODE.jpg"` becomes a
// `require(...)` for RN's Metro bundler. Match the file's actual on-disk
// casing exactly — Android/Linux resolve this case-sensitively even if it
// happens to work on macOS.

export default function PaymentQRCode()
{
    const { colors } = useThemedStyles();

    return (
        <View
            style={{
                height: 240,
                width: "100%",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
            }}
        >
            <Image
                source={{ uri: "https://smpjobs.blob.core.windows.net/app/QRCODE.JPG" }}
                style={{ width: 160, height: 160, borderRadius: 6 }}
                resizeMode="contain"
            />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.foreground }}>
                Shree Maruthi Printer
            </Text>
        </View>
    );
}