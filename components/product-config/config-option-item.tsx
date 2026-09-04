import { useThemedStyles } from '@/lib/useThemedStyles';
import { OptionItem } from '@/types';
import { useMemo, type FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { CartFormSchemaType, isOptionDisabled, toggleValue } from './config';
import { SelectableFieldKey } from './type';

interface OptionItemProps
{
    availableOptions: string[]
    markTouched: (payload: any) => void
    name: SelectableFieldKey
    options: OptionItem[]
    label: string
    renderItem?: 'text' | 'image'
}

const ConfigOptionItem: FC<OptionItemProps> = ({
    availableOptions = [],
    markTouched,
    name,
    label,
    options = [],
    renderItem = "text"
}) =>
{
    const appTheme = useThemedStyles()
    const { control } = useFormContext<CartFormSchemaType>()
    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: "center",
            padding: 8,
            gap: 5
        },
        label: {
            fontSize: 16,
            fontWeight: "bold",
            paddingHorizontal: 8
        },
        required: {
            color: appTheme.colors.destructive
        },
        image: {
            height: 95,
            width: 95
        },
        error: {
            fontWeight: "bold",
            fontSize: 16,
            color: appTheme.colors.destructive
        }
    }), [appTheme.colors])

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <View>
                    <Text style={[styles.label]}>{label} <Text style={[styles.required]}>*</Text></Text>
                    <View style={[styles.container]}>
                        {options.map(option =>
                        {
                            const disabled = isOptionDisabled(availableOptions, option.value)
                            const selected = option.value == field.value
                            return (
                                <Pressable
                                    key={option.value}
                                    disabled={disabled}
                                    style={[
                                        selected
                                            ? appTheme.styles.primaryButton
                                            : disabled
                                                ? appTheme.styles.disabledButton
                                                : appTheme.styles.button,
                                        {
                                            paddingHorizontal:
                                                renderItem == "image"
                                                    ? 4
                                                    : appTheme.styles.button.paddingHorizontal,
                                            paddingVertical:
                                                renderItem == "image"
                                                    ? 4
                                                    : appTheme.styles.button.paddingVertical,
                                            borderColor: appTheme.colors.primary
                                        }
                                    ]}
                                    onPress={() =>
                                    {
                                        markTouched(name)
                                        field.onChange(toggleValue(field.value, option.value))
                                    }}
                                >
                                    {renderItem == "text"
                                        ? (
                                            <Text
                                                style={[
                                                    selected
                                                        ? appTheme.styles.primaryButtonText
                                                        : disabled
                                                            ? appTheme.styles.disabledButtonText
                                                            : appTheme.styles.buttonText,
                                                    { fontSize: 14 },
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                        ) : (
                                            <ImageBackground
                                                source={{ uri: option.label }}
                                                style={[styles.image]}
                                            />
                                        )}
                                </Pressable>
                            )
                        })}
                    </View>
                    {fieldState.error
                        && fieldState.error.message
                        && (
                            <Text style={[styles.error]}>
                                {fieldState.error.message}
                            </Text>
                        )}
                </View>
            )}
        />
    );
}

export default ConfigOptionItem;
