import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { Pressable, Text } from 'react-native';
import { useAuth } from '../auth/config';

interface LogoutBtnProps { }

const LogoutBtn: FC<LogoutBtnProps> = () =>
{
    const { signOutAsync } = useAuth()
    const appTheme = useThemedStyles()
    return (
        <Pressable onPress={signOutAsync} style={[appTheme.styles.destructiveButton]}>
            <Text style={[appTheme.styles.primaryButtonText]}>Logout</Text>
        </Pressable>
    );
}

export default LogoutBtn;
