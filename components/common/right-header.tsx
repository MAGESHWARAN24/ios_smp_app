import { useThemedStyles } from '@/lib/useThemedStyles';
import { Wallet } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useAuth } from '../auth/config';
import { useCart } from '../cart/config';

interface RightHeaderProps { }

const RightHeader = (props: RightHeaderProps) =>
{
    const { cart } = useCart()
    const { isAuthenticated } = useAuth()
    const { colors } = useThemedStyles()


    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 }}>
            {isAuthenticated && (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        height: 40,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        backgroundColor: colors.accent + '15',
                    }}
                >
                    <Wallet size={16} color={colors.accent} />
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.accent }}>
                        Rs. {cart?.totalWalletAmount ?? 0}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default RightHeader;