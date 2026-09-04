import { api } from '@/lib/api';
import { fonts, spacing } from '@/lib/theme';
import { useThemedStyles } from '@/lib/useThemedStyles';
import type { Filter, OptionItem } from '@/types';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import
{
    ActivityIndicator,
    FlatList,
    Keyboard,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ComboboxProps
{
    value?: OptionItem;
    onValueChange: (item: OptionItem) => void;
    path: string;
    disabled?: boolean;
    placeholder?: string;
    cascadeFilter?: Filter[];
    mode?: 'static' | 'dynamic';
}

const Combobox = forwardRef<any, ComboboxProps>(
    ({ value, onValueChange, path, disabled, placeholder = 'Select...', cascadeFilter }, ref) =>
    {
        const appTheme = useThemedStyles();
        const { colors, styles: themedStyles } = appTheme;

        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState('');
        const [options, setOptions] = useState<OptionItem[]>([]);
        const [loading, setLoading] = useState(false);
        const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        const fetchOptions = useCallback(
            async (searchString: string) =>
            {
                setLoading(true);
                try
                {
                    const url = searchString
                        ? `${path}=${searchString}`
                        : `${path}`
                    const response = await api.post(url, { cascadeFilter, defaultValue: [] });
                    if (response.status === 200 && response.data)
                    {
                        setOptions(response.data.items ?? response.data ?? []);
                    }
                } catch
                {
                    setOptions([]);
                } finally
                {
                    setLoading(false);
                }
            },
            [path, cascadeFilter],
        );

        useEffect(() =>
        {
            if (!open) return;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() =>
            {
                fetchOptions(query);
            }, 350);
            return () =>
            {
                if (debounceRef.current) clearTimeout(debounceRef.current);
            };
        }, [query, open, fetchOptions]);

        const handleOpen = () =>
        {
            if (disabled) return;
            setQuery('');
            setOpen(true);
            fetchOptions('');
        };

        const handleSelect = (item: OptionItem) =>
        {
            onValueChange(item);
            setOpen(false);
            Keyboard.dismiss();
        };

        return (
            <>
                <TouchableOpacity
                    ref={ref}
                    activeOpacity={0.7}
                    onPress={handleOpen}
                    disabled={disabled}
                    style={[
                        themedStyles.input,
                        styles.trigger,
                        disabled && { opacity: 0.5 },
                    ]}
                >
                    <Text
                        numberOfLines={1}
                        style={[
                            themedStyles.text,
                            styles.triggerText,
                            !value?.label && { color: colors.mutedForeground },
                        ]}
                    >
                        {value?.label || placeholder}
                    </Text>
                    <Text style={{ color: colors.mutedForeground }}>▾</Text>
                </TouchableOpacity>

                <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
                    <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                        <Pressable
                            style={[themedStyles.card, styles.sheet, { backgroundColor: colors.popover }]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <TextInput
                                autoFocus
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search..."
                                placeholderTextColor={colors.mutedForeground}
                                style={[themedStyles.input, styles.searchInput]}
                            />

                            {loading ? (
                                <View style={styles.centered}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                </View>
                            ) : options.length === 0 ? (
                                <View style={styles.centered}>
                                    <Text style={themedStyles.mutedText}>No results found</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={options}
                                    keyboardShouldPersistTaps="handled"
                                    style={styles.list}
                                    ItemSeparatorComponent={() => (
                                        <View style={[styles.separator, { backgroundColor: colors.border }]} />
                                    )}
                                    renderItem={({ item }) =>
                                    {
                                        const selected = item.value === value?.value;
                                        return (
                                            <TouchableOpacity
                                                onPress={() => handleSelect(item)}
                                                style={[
                                                    styles.option,
                                                    selected && { backgroundColor: colors.secondary },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        themedStyles.text,
                                                        selected && { color: colors.primary, fontFamily: fonts.sansMedium },
                                                    ]}
                                                >
                                                    {item.label}
                                                </Text>
                                                {selected && <Text style={{ color: colors.primary }}>✓</Text>}
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            )}
                        </Pressable>
                    </Pressable>
                </Modal>
            </>
        );
    },
);

Combobox.displayName = 'Combobox';

export { Combobox };

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    triggerText: {
        flex: 1,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        maxHeight: '70%',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: spacing * 4,
    },
    searchInput: {
        marginBottom: spacing * 2,
    },
    list: {
        flexGrow: 0,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing * 3,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
    },
    centered: {
        paddingVertical: spacing * 6,
        alignItems: 'center',
    },
});