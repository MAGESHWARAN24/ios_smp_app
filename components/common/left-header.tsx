import { useThemedStyles } from '@/lib/useThemedStyles';
import { Text, View } from 'react-native';
import { useAuth } from '../auth/config';
import AppLogo from './app-logo';

interface LeftHeaderProps { }

const LeftHeader = (props: LeftHeaderProps) =>
{
    const { isAuthenticated, user } = useAuth()
    const { colors, styles } = useThemedStyles()

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppLogo style={{ height: 40, width: 40 }} />
            <View>
                <Text style={[styles.title, { fontSize: 15 }]} numberOfLines={1}>
                    Shree Maruthi Printers
                </Text>
                {isAuthenticated && user && (
                    <Text style={[styles.mutedText, { fontSize: 11 }]} numberOfLines={1}>
                        Welcome, {user.name}
                    </Text>
                )}
            </View>
        </View>
    );
}

export default LeftHeader;