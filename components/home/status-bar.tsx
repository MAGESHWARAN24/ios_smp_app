import { useThemedStyles } from '@/lib/useThemedStyles';
import { Text, View } from 'react-native';

const stats = [
    { value: '10K+', label: 'Business Clients' },
    { value: '500K+', label: 'Orders Completed' },
    { value: '99.8%', label: 'On-Time Delivery' },
    { value: '24/7', label: 'Support Available' },
];

const StatsBar = () =>
{
    const { colors, styles } = useThemedStyles()

    return (
        <View
            style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.card,
                paddingVertical: 24,
                paddingHorizontal: 16,
            }}
        >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {stats.map((stat) => (
                    <View key={stat.label} style={{ width: '50%', alignItems: 'center', paddingVertical: 12 }}>
                        <Text style={[styles.title, { fontSize: 26, fontWeight: 'bold', color: colors.accent }]}>
                            {stat.value}
                        </Text>
                        <Text style={[styles.mutedText, { marginTop: 4, textAlign: 'center' }]}>
                            {stat.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default StatsBar