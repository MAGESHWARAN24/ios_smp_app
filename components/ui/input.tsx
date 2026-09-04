import { useThemedStyles } from '@/lib/useThemedStyles';
import type { ComponentProps, FC } from 'react';
import { TextInput } from 'react-native';

interface InputProps extends ComponentProps<typeof TextInput> { }

const Input: FC<InputProps> = ({ style, ...props }) =>
{
    const { styles, colors } = useThemedStyles()
    return (
        <TextInput
            style={[styles.input, style, { backgroundColor: colors.card }]}
            {...props}
        />
    );
}

export default Input;
