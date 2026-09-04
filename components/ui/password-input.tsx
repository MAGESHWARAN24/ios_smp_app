import { radius, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import { Eye, EyeOff } from 'lucide-react-native';
import { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface PasswordInputProps extends TextInputProps { }

const PasswordInput = forwardRef<TextInput, PasswordInputProps>(({ style, ...rest }, ref) =>
{
    const { colors } = useThemedStyles()
    const [visible, setVisible] = useState(false)

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.input,
                borderRadius: radius.md,
                backgroundColor: colors.background,
            }}
        >
            <TextInput
                ref={ref}
                secureTextEntry={!visible}
                placeholderTextColor={colors.mutedForeground}
                style={[
                    {
                        flex: 1,
                        paddingHorizontal: spacing * 3,
                        paddingVertical: spacing * 2.5,
                        color: colors.foreground,
                        height: 50,
                    },
                    style,
                ]}
                {...rest}
            />
            <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8} style={{ paddingHorizontal: spacing * 3 }}>
                {visible ? (
                    <EyeOff size={18} color={colors.mutedForeground} />
                ) : (
                    <Eye size={18} color={colors.mutedForeground} />
                )}
            </TouchableOpacity>
        </View>
    )
})

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput;