import { api } from '@/lib/api';
import { spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { AxiosError } from 'axios';
import { CalendarDays, Mail, MapPin, Phone, Wallet } from 'lucide-react-native';
import { useEffect, useState, type FC } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useApiAction } from '../api-actions/hook';
import { useCart } from '../cart/config';
import { ProfileDetails } from './type';

interface ProfileCardProps { }

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(n)

const fmtDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const getStatusColors = (status: string, colors: ReturnType<typeof useThemedStyles>['colors']) =>
{
    switch (status)
    {
        case 'APPROVED':
            return { fg: '#16a34a', bg: '#16a34a20' }
        case 'REJECTED':
            return { fg: colors.destructive, bg: colors.destructive + '20' }
        case 'PENDING':
            return { fg: '#f59e0b', bg: '#f59e0b20' }
        default:
            return { fg: colors.mutedForeground, bg: colors.muted }
    }
}

const ProfileCard: FC<ProfileCardProps> = () =>
{
    const { colors, styles, shadows } = useThemedStyles()
    const { apiActionAsync } = useApiAction()
    const { cart, fetchData } = useCart()
    const [profile, setProfile] = useState<ProfileDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() =>
    {
        const fetchProfileAsync = async () =>
        {
            try
            {
                const response = await api.get('users/getdetails')
                if (response.status === 200 && response.data?.payload)
                {
                    setProfile(response.data.payload)
                }
            } catch (error)
            {
                if (error instanceof AxiosError && error.response)
                {
                    await apiActionAsync(error.response)
                }
            } finally
            {
                await fetchData()
                setLoading(false)
            }
        }
        fetchProfileAsync()
    }, [])

    if (loading)
    {
        return (
            <View style={[styles.card, { ...shadows.sm, padding: spacing * 6, alignItems: 'center' }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        )
    }

    if (!profile)
    {
        return null
    }

    const statusColors = getStatusColors(profile.status, colors)
    const initial = profile.companyName?.charAt(0)?.toUpperCase() ?? '?'

    const addressParts = [
        profile.addressLine1,
        profile.addressLine2,
        profile.city,
        profile.district,
        profile.state,
        profile.pincode,
        profile.country,
    ].filter(Boolean)

    return (
        <View style={[styles.card, { ...shadows.sm, padding: spacing * 4, gap: spacing * 4 }]}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing * 3 }}>
                <View
                    style={{
                        height: 52,
                        width: 52,
                        borderRadius: 16,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.primaryForeground }}>
                        {initial}
                    </Text>
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.title, { fontSize: 16, fontWeight: 'bold' }]} numberOfLines={1}>
                        {profile.companyName}
                    </Text>
                    <View
                        style={{
                            alignSelf: 'flex-start',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 999,
                            backgroundColor: statusColors.bg,
                        }}
                    >
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: statusColors.fg, textTransform: 'uppercase' }}>
                            {profile.status}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* Contact info */}
            <View style={{ gap: spacing * 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} color={colors.mutedForeground} />
                    <Text style={[styles.mutedText, { fontSize: 13, flex: 1 }]} numberOfLines={1}>
                        {profile.email}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Phone size={14} color={colors.mutedForeground} />
                    <Text style={[styles.mutedText, { fontSize: 13 }]}>{profile.mobileNo}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                    <MapPin size={14} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                    <Text style={[styles.mutedText, { fontSize: 13, flex: 1, lineHeight: 18 }]}>
                        {addressParts.join(', ')}
                    </Text>
                </View>
                {!!profile.gstNumber && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.mutedForeground }}>GST</Text>
                        <Text style={[styles.mutedText, { fontSize: 13 }]}>{profile.gstNumber}</Text>
                    </View>
                )}
            </View>

            <View style={{ height: 1, backgroundColor: colors.border }} />

            {/* Footer stats */}
            <View style={{ flexDirection: 'row', gap: spacing * 3 }}>
                <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Wallet size={13} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.mutedForeground }}>
                            Wallet
                        </Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.foreground }}>
                        {fmtCurrency(cart.totalWalletAmount)}
                    </Text>
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={13} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.mutedForeground }}>
                            Member since
                        </Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.foreground }}>
                        {fmtDate(profile.memberSince)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default ProfileCard;