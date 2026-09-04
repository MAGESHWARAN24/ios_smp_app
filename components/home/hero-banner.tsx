import { api } from '@/lib/api';
import { radius } from '@/lib/theme';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import
{
    ImageBackground,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    useWindowDimensions,
    View
} from 'react-native';
import type { HeroBannerConfig } from './type';

interface HeroBannerProps { }

const ITEM_MARGIN = 10;
const CONTAINER_PADDING = 10;
const AUTOPLAY_INTERVAL_MS = 4000;

const HeroBanner: FC<HeroBannerProps> = () =>
{
    const { width } = useWindowDimensions()
    const [items, setItems] = useState<HeroBannerConfig[]>([])
    const [index, setIndex] = useState<number>(0)

    const scrollRef = useRef<ScrollView>(null)
    const indexRef = useRef(0)
    const isUserInteracting = useRef(false)

    // width of one slide including the gap to the next one, used both for
    // sizing each card and for computing scroll offsets
    const itemWidth = width - CONTAINER_PADDING * 2
    const step = itemWidth + ITEM_MARGIN

    useEffect(() =>
    {
        const fetchData = async () =>
        {
            try
            {
                const response = await api.get(`cmsherobanner/getall`)
                if (response.status == 200 && response.data)
                {
                    setItems(response.data ?? [])
                }
            } catch (error)
            {
                if (error instanceof AxiosError && error)
                {
                    console.warn('Failed to fetch hero Herobanners', error.message)
                }
            }
        }
        fetchData()
    }, [])

    // keep a ref in sync with state so the interval callback below always
    // reads the latest index without needing to be re-created every render
    useEffect(() =>
    {
        indexRef.current = index
    }, [index])

    useEffect(() =>
    {
        if (items.length < 2)
        {
            return
        }

        const interval = setInterval(() =>
        {
            if (isUserInteracting.current)
            {
                return
            }

            const nextIndex = (indexRef.current + 1) % items.length
            scrollRef.current?.scrollTo({ x: nextIndex * step, animated: true })
            setIndex(nextIndex)
        }, AUTOPLAY_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [items, step])

    const handleScrollBeginDrag = useCallback(() =>
    {
        isUserInteracting.current = true
    }, [])

    const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) =>
    {
        const offsetX = event.nativeEvent.contentOffset.x
        const nearestIndex = Math.max(0, Math.min(items.length - 1, Math.round(offsetX / step)))
        setIndex(nearestIndex)
        isUserInteracting.current = false
    }, [items.length, step])

    return (
        <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={step}
            snapToAlignment="start"
            decelerationRate="fast"
            onScrollBeginDrag={handleScrollBeginDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            contentContainerStyle={{ paddingHorizontal: CONTAINER_PADDING }}
            style={{ height: 250 }}
        >
            {items.map((slide, i) =>
            {
                const textColor = slide.textColorLight
                const bgColor = slide.backgroundColorLight

                return (
                    <View
                        key={slide.id}
                        style={{
                            width: itemWidth,
                            height: 230,
                            borderRadius: radius.xl,
                            overflow: 'hidden',
                            marginRight: ITEM_MARGIN,
                            backgroundColor: bgColor,
                        }}
                    >
                        <ImageBackground
                            source={{ uri: slide.imageUrl }}
                            style={{ flex: 1, justifyContent: 'center' }}
                            resizeMode="cover"
                        >
                            <View style={{ padding: 24, maxWidth: 400 }}>
                                {slide.badge && (
                                    <View
                                        style={{
                                            alignSelf: 'flex-start',
                                            backgroundColor: bgColor,
                                            borderRadius: 999,
                                            paddingHorizontal: 16,
                                            paddingVertical: 6,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                fontWeight: '500',
                                                color: textColor,
                                            }}
                                        >
                                            {slide.badge.trim()}
                                        </Text>
                                    </View>
                                )}

                                {slide.title && (
                                    <Text
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 'bold',
                                            marginBottom: 12,
                                            color: textColor,
                                        }}
                                    >
                                        {slide.title}
                                    </Text>
                                )}

                                {slide.description && (
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            marginBottom: 24,
                                            opacity: 0.8,
                                            color: textColor,
                                        }}
                                    >
                                        {slide.description}
                                    </Text>
                                )}
                            </View>
                        </ImageBackground>
                    </View>
                )
            })}
        </ScrollView>
    );
}

export default HeroBanner;