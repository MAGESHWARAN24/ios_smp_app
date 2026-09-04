import { useThemedStyles } from '@/lib/useThemedStyles';
import type { FC } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useProduct } from './config';

interface CategoryBadgeProps { }

const CategoryBadge: FC<CategoryBadgeProps> = () =>
{
    const { styles, colors, shadows } = useThemedStyles()
    const { items, filter, applyFilter } = useProduct()
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                gap: 5,
                paddingVertical: 10,
                paddingHorizontal: 5,
                height: 'auto'
            }}
        >
            {items.types.map(item => (
                <Pressable
                    key={item.value}
                    onPress={() => applyFilter({ productTypeId: item.value, searchString: filter.searchString })}
                >
                    <View
                        style={{
                            ...styles.badge,
                            height: 40,
                            backgroundColor: filter.productTypeId == item.value ? colors.primary : colors.card,
                            borderColor: filter.productTypeId == item.value ? colors.primary : colors.card,
                            borderStyle: "solid",
                            borderWidth: 1,
                            ...shadows.sm
                        }}
                    >
                        <Text
                            style={{
                                color: filter.productTypeId == item.value ? "white" : "",
                                fontWeight: filter.productTypeId == item.value ? "bold" : "normal"
                            }}
                        >
                            {item.description}
                        </Text>
                    </View>
                </Pressable>
            ))}
        </ScrollView>
    );
}

export default CategoryBadge;
