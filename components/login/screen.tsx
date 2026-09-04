import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DMLForm from './dml-form';

interface LoginScreenProps { }

const LoginScreen: FC<LoginScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    return (
        <SafeAreaView style={[appTheme.styles.screen, { justifyContent: "center", padding: 20 }]}>
            <DMLForm />
        </SafeAreaView>
    );
}

export default LoginScreen;
