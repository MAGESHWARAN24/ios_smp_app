import { radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { useRouter } from 'expo-router';
import { useMemo, type FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { presetNavigationItems } from './config';

interface PresetNavigationProps { }


const PresetNavigation: FC<PresetNavigationProps> = () =>
{
    const appTheme = useThemedStyles()
    const router = useRouter()

    const styles = useMemo(() => StyleSheet.create({
        container: {
            paddingVertical: 15,
            gap: spacing * 4,
            flexDirection: 'column',
            alignContent: "center",
            justifyContent: "center",
            backgroundColor: appTheme.colors.background
        },
        button: {
            height: 60,
            flexDirection: 'row',
            alignContent: "center",
            justifyContent: "flex-start",
            gap: 10,
            elevation: 1,
            padding: 18,
            borderRadius: radius.sm
        }
    }), [appTheme])

    return (
        <View style={[styles.container]}>
            {presetNavigationItems.map((item, index) =>
            {
                const Icon = item.icon
                return (
                    <Pressable
                        key={index}
                        onPress={() => router.push(item.value as any)}
                        style={[appTheme.styles.card, styles.button]}
                    >
                        <Icon size={20} color={appTheme.colors.foreground} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: appTheme.colors.foreground }}>
                            {item.label}
                        </Text>
                    </Pressable>
                )
            })}
        </View>
    );
}

export default PresetNavigation;