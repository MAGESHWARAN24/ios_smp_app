import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface AppLogoProps
{
    style?: any
}

const styles = StyleSheet.create({
    container: {
        height: 150,
        width: 150,
    }
})

const AppLogo: FC<AppLogoProps> = ({ style = {} }) =>
{
    const appTheme = useThemedStyles()

    return (
        <ImageBackground
            style={[styles.container, style]}
            source={{ uri: `https://www.shreemaruthiprinters.in/images/logo.${appTheme.scheme}.png` }}
        />
    );
}

export default AppLogo;
