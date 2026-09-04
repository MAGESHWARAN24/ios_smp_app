import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { fonts, getColors, getShadows, letterSpacing, radius, spacing } from './theme';

export function useThemedStyles()
{
  const scheme = useColorScheme();
  const colors = getColors(scheme === 'dark' ? 'dark' : 'light');
  const shadows = getShadows(scheme === 'dark' ? 'dark' : 'light')
  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: colors.background,
        },
        badge: {
          borderRadius: radius.md,
          padding: 8,
          alignSelf: 'flex-start',
          alignItems: "center",
          justifyContent: "center",
          color: colors.primary,
          backgroundColor: colors.primaryForeground,
          paddingHorizontal: spacing * 2,
          paddingVertical: spacing * 0.5,
          borderColor: colors.background
        },
        card: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing * 4,
          ...getShadows(scheme),
        },
        title: {
          color: colors.cardForeground,
          fontFamily: fonts.sansSemiBold,
          fontSize: 18,
          letterSpacing,
        },
        text: {
          color: colors.foreground,
          fontFamily: fonts.sans,
          fontSize: 14,
          letterSpacing,
        },
        mutedText: {
          color: colors.mutedForeground,
          fontFamily: fonts.sans,
          fontSize: 13,
        },
        button: {
          backgroundColor: colors.background,
          borderRadius: radius.md,
          paddingVertical: spacing * 3,
          paddingHorizontal: spacing * 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: colors.border,
          borderWidth: 1
        },
        buttonText: {
          color: colors.primary,
          fontFamily: fonts.sansMedium,
          fontSize: 15,
        },
        disabledButton: {
          backgroundColor: colors.muted,
          borderRadius: radius.md,
          paddingVertical: spacing * 3,
          paddingHorizontal: spacing * 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: colors.cardForeground,
          borderWidth: 0.5,
          opacity: 40
        },
        disabledButtonText: {
          color: colors.mutedForeground,
          fontFamily: fonts.sansMedium,
          fontSize: 15,
          fontWeight: "400"
        },
        primaryButton: {
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          paddingVertical: spacing * 3,
          paddingHorizontal: spacing * 5,
          alignItems: 'center',
          justifyContent: 'center',
        },
        primaryButtonText: {
          color: colors.primaryForeground,
          fontFamily: fonts.sansMedium,
          fontSize: 15,
        },
        destructiveButton: {
          backgroundColor: colors.destructive,
          borderRadius: radius.md,
          paddingVertical: spacing * 3,
          paddingHorizontal: spacing * 5,
          alignItems: 'center',
          justifyContent: 'center',
        },
        input: {
          backgroundColor: colors.background,
          borderColor: colors.input,
          borderWidth: 1,
          borderRadius: radius.md,
          paddingHorizontal: spacing * 3,
          paddingVertical: spacing * 2.5,
          color: colors.foreground,
          fontFamily: fonts.sans,
          width: "auto",
          height: 50
        },
        sidebar: {
          backgroundColor: colors.sidebar,
          borderRightColor: colors.sidebarBorder,
          borderRightWidth: 1,
        },
        avatar: {
          height: 50,
          width: 50,
          backgroundColor: colors.primary,
          borderRadius: radius.lg,
          alignItems: "center",
          justifyContent: "center"
        },
        avatarText: {
          color: colors.background,
          fontSize: 16,
          fontWeight: "bold"
        }
      }),
    [colors],
  );

  return { colors, styles, scheme, shadows };
}
