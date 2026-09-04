import PasswordInput from '@/components/ui/password-input';
import { api } from '@/lib/api';
import { fonts, letterSpacing, radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState, type FC } from 'react';
import
{
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiAction } from '../api-actions/hook';

interface ForgetPasswordScreenProps { }

type Step = 'email' | 'otp' | 'password';

interface ValidatedUser
{
    id: string;
    email: string;
    name: string
}

const OTP_LENGTH = 6;
const OTP_VALIDITY_SECONDS = 5 * 60;

// Client-side daily cap on OTP requests per email. There's no backend field
// for this in what was given, so it's tracked locally in AsyncStorage keyed
// by email + today's date — this only protects against re-requesting from
// THIS device/install, not a real server-side rate limit. If the backend can
// enforce this itself (e.g. returning isFailure with a specific reason once
// exceeded), that would be the more robust source of truth.
const DAILY_OTP_LIMIT = 7;

const fmtCountdown = (totalSeconds: number) =>
{
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const todayKey = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD

const getOtpAttemptsToday = async (email: string): Promise<number> =>
{
    try
    {
        const raw = await AsyncStorage.getItem(`otp_attempts:${email.toLowerCase()}`)
        if (!raw) return 0
        const parsed = JSON.parse(raw) as { date: string; count: number }
        if (parsed.date !== todayKey()) return 0 // stale entry from a previous day
        return parsed.count
    } catch
    {
        return 0
    }
}

const incrementOtpAttemptsToday = async (email: string): Promise<number> =>
{
    const current = await getOtpAttemptsToday(email)
    const next = current + 1
    try
    {
        await AsyncStorage.setItem(
            `otp_attempts:${email.toLowerCase()}`,
            JSON.stringify({ date: todayKey(), count: next })
        )
    } catch
    {
        // best-effort — if storage fails we still let the request through
        // rather than blocking the user over a local persistence error
    }
    return next
}

/* ─── OTP input: 6 individual boxes with auto-advance/back-fill ─────────── */

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void })
{
    const { colors } = useThemedStyles()
    const inputs = useRef<(TextInput | null)[]>([])

    const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH)

    const handleChange = (text: string, index: number) =>
    {
        // handles both single-digit typing and pasting a full code into one box
        const clean = text.replace(/[^0-9]/g, '')
        if (!clean)
        {
            const next = value.slice(0, index) + value.slice(index + 1)
            onChange(next)
            return
        }

        if (clean.length > 1)
        {
            onChange(clean.slice(0, OTP_LENGTH))
            inputs.current[Math.min(clean.length, OTP_LENGTH) - 1]?.focus()
            return
        }

        const next = (value.slice(0, index) + clean + value.slice(index + 1)).slice(0, OTP_LENGTH)
        onChange(next)
        if (index < OTP_LENGTH - 1)
        {
            inputs.current[index + 1]?.focus()
        }
    }

    const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) =>
    {
        if (e.nativeEvent.key === 'Backspace' && !digits[index]?.trim() && index > 0)
        {
            inputs.current[index - 1]?.focus()
        }
    }

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing * 2 }}>
            {digits.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(el) => { inputs.current[index] = el }}
                    value={digit.trim()}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={OTP_LENGTH} // allows paste-into-one-box to work
                    style={{
                        flex: 1,
                        height: 52,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: '700',
                        color: colors.foreground,
                        backgroundColor: colors.card,
                    }}
                />
            ))}
        </View>
    )
}

const ForgetPasswordScreen: FC<ForgetPasswordScreenProps> = () =>
{
    const appTheme = useThemedStyles()
    const { colors, styles } = appTheme
    const { apiActionAsync } = useApiAction()
    const router = useRouter()

    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validatedUser, setValidatedUser] = useState<ValidatedUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorText, setErrorText] = useState('')
    const [secondsLeft, setSecondsLeft] = useState(OTP_VALIDITY_SECONDS)
    const [attemptsToday, setAttemptsToday] = useState(0)

    // Countdown starts fresh each time the OTP step is entered.
    useEffect(() =>
    {
        if (step !== 'otp')
        {
            return
        }

        setSecondsLeft(OTP_VALIDITY_SECONDS)
        const interval = setInterval(() =>
        {
            setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
        }, 1000)

        return () => clearInterval(interval)
    }, [step])

    // Reflect today's already-used attempt count for whatever email is typed,
    // so the limit UI is accurate even before the first request this session.
    useEffect(() =>
    {
        if (!email.trim())
        {
            setAttemptsToday(0)
            return
        }
        getOtpAttemptsToday(email).then(setAttemptsToday)
    }, [email])

    const attemptsRemaining = DAILY_OTP_LIMIT - attemptsToday
    const limitReached = attemptsRemaining <= 0

    const goBack = () =>
    {
        if (step === 'otp')
        {
            setStep('email')
            setOtp('')
            return
        }
        if (step === 'password')
        {
            setStep('otp')
            return
        }
        router.back()
    }

    const requestOtp = async () =>
    {
        setErrorText('')

        if (!/^\S+@\S+\.\S+$/.test(email.trim()))
        {
            setErrorText('Enter a valid email address')
            return
        }

        const attemptsSoFar = await getOtpAttemptsToday(email)
        if (attemptsSoFar >= DAILY_OTP_LIMIT)
        {
            setAttemptsToday(attemptsSoFar)
            setErrorText(`You've reached the limit of ${DAILY_OTP_LIMIT} OTP requests for today. Please try again tomorrow.`)
            return
        }

        setLoading(true)
        try
        {
            const response = await api.post('mobile/forget-password/getotp', { Email: email.trim() })
            if (response.data.isSuccess)
            {
                const newCount = await incrementOtpAttemptsToday(email)
                setAttemptsToday(newCount)
                await apiActionAsync(response)
                setValidatedUser(response.data.payload)
                setStep('otp')
                setSecondsLeft(OTP_VALIDITY_SECONDS)
            } else if (response.data.isFailure)
            {
                await apiActionAsync(response)
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        } finally
        {
            setLoading(false)
        }
    }

    const validateOtp = async () =>
    {
        setErrorText('')
        if (otp.length < OTP_LENGTH)
        {
            setErrorText('Enter the 6-digit code')
            return
        }
        if (secondsLeft === 0)
        {
            setErrorText('This code has expired. Please request a new one.')
            return
        }

        setLoading(true)
        try
        {
            const response = await api.post('mobile/validate/otp', {
                SharedKey: validatedUser
                    ? validatedUser.id
                    : "",
                Email: email,
                Code: otp
            })
            if (response.data.isSuccess && response.data.payload)
            {
                await apiActionAsync(response)
                setStep('password')
            } else if (response.data.isFailure)
            {
                await apiActionAsync(response)
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        } finally
        {
            setLoading(false)
        }
    }

    const submitNewPassword = async () =>
    {
        setErrorText('')
        if (newPassword.length < 8)
        {
            setErrorText('Password must be at least 8 characters')
            return
        }
        if (newPassword !== confirmPassword)
        {
            setErrorText("Passwords don't match")
            return
        }

        setLoading(true)
        try
        {
            const response = await api.post('mobile/change-password', {
                newPassword,
                currentPassword: confirmPassword,
                sharedKey: validatedUser
                    ? validatedUser.id
                    : "",
            })

            if (response.data.isSuccess)
            {
                router.replace('/auth/login' as any)
            } else if (response.data?.isFailure)
            {
                await apiActionAsync(response)
            }
        } catch (error)
        {
            if (error instanceof AxiosError && error.response)
            {
                await apiActionAsync(error.response)
            }
        } finally
        {
            setLoading(false)
        }
    }

    const stepConfig: Record<Step, { title: string; subtitle: string }> = {
        email: {
            title: 'Forgot password',
            subtitle: 'Enter the email address linked to your account to reset your password',
        },
        otp: {
            title: 'Enter verification code',
            subtitle: `We sent a 6-digit code to ${email}`,
        },
        password: {
            title: 'Set a new password',
            subtitle: validatedUser?.name ? `Resetting password for ${validatedUser.name}` : 'Choose a new password for your account',
        },
    }

    return (
        <SafeAreaView style={[styles.screen, { flex: 1 }]} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing * 3, padding: spacing * 4 }}>
                    <Pressable
                        onPress={goBack}
                        style={{
                            height: 36,
                            width: 36,
                            borderRadius: 999,
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ChevronLeft size={18} color={colors.foreground} />
                    </Pressable>
                </View>
                <ScrollView
                    contentContainerStyle={{ padding: spacing * 5, gap: spacing * 5 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ gap: 6 }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', fontFamily: fonts.sansBold, color: colors.foreground, letterSpacing }}>
                            {stepConfig[step].title}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 19 }}>
                            {stepConfig[step].subtitle}
                        </Text>
                    </View>

                    {step === 'email' && (
                        <View style={{ gap: spacing * 2 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                                Email address <Text style={{ color: colors.destructive }}>*</Text>
                            </Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholder="Enter your registered email address"
                                placeholderTextColor={colors.mutedForeground}
                                style={styles.input}
                                autoFocus
                            />
                            {email.trim().length > 0 && (
                                <Text style={{ fontSize: 12, color: limitReached ? colors.destructive : colors.mutedForeground }}>
                                    {limitReached
                                        ? `Daily OTP limit reached (${DAILY_OTP_LIMIT}/${DAILY_OTP_LIMIT}). Try again tomorrow.`
                                        : `${attemptsRemaining} of ${DAILY_OTP_LIMIT} OTP requests remaining today`}
                                </Text>
                            )}
                        </View>
                    )}

                    {step === 'otp' && (
                        <View style={{ gap: spacing * 3 }}>
                            <OtpInput value={otp} onChange={setOtp} />
                            <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: 'center' }}>
                                {secondsLeft > 0
                                    ? `Code expires in ${fmtCountdown(secondsLeft)}`
                                    : 'Code expired'}
                            </Text>
                            <Pressable onPress={requestOtp} disabled={loading || secondsLeft > 0 || limitReached} hitSlop={8}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        color: (secondsLeft > 0 || limitReached) ? colors.mutedForeground : colors.primary,
                                    }}
                                >
                                    {limitReached
                                        ? `Daily limit reached (${DAILY_OTP_LIMIT}/${DAILY_OTP_LIMIT})`
                                        : secondsLeft > 0
                                            ? "Didn't get a code? Resend OTP"
                                            : 'Resend OTP'}
                                </Text>
                            </Pressable>
                            <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: 'center' }}>
                                {attemptsRemaining} of {DAILY_OTP_LIMIT} OTP requests remaining today
                            </Text>
                        </View>
                    )}

                    {step === 'password' && (
                        <View style={{ gap: spacing * 4 }}>
                            <View style={{ gap: spacing * 2 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                                    New password <Text style={{ color: colors.destructive }}>*</Text>
                                </Text>
                                <PasswordInput
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                />
                            </View>
                            <View style={{ gap: spacing * 2 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                                    Confirm password <Text style={{ color: colors.destructive }}>*</Text>
                                </Text>
                                <PasswordInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Re-enter new password"
                                />
                            </View>
                        </View>
                    )}

                    {!!errorText && (
                        <Text style={{ fontSize: 12, color: colors.destructive }}>{errorText}</Text>
                    )}

                    <Pressable
                        onPress={step === 'email' ? requestOtp : step === 'otp' ? validateOtp : submitNewPassword}
                        disabled={loading || (step === 'email' && limitReached)}
                        style={{
                            paddingVertical: spacing * 3.5,
                            borderRadius: radius.md,
                            alignItems: 'center',
                            backgroundColor: (loading || (step === 'email' && limitReached)) ? colors.muted : colors.primary,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.primaryForeground} />
                        ) : (
                            <Text style={{ color: colors.primaryForeground, fontWeight: 'bold', fontSize: 15 }}>
                                {step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify code' : 'Reset password'}
                            </Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default ForgetPasswordScreen;