import { useCallback, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const END_TOLERANCE_PX = 24;

/** Tracks read progress of a policy ScrollView; `reachedEnd` is true once the content fits
 * on screen or the reader has scrolled to the bottom. */
export function usePolicyScroll() {
  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  const measured = contentHeight > 0 && layoutHeight > 0;
  const scrollable = contentHeight - layoutHeight;
  const fits = measured && scrollable <= END_TOLERANCE_PX;
  const progress = !measured ? 0 : fits ? 100 : Math.min(100, Math.max(0, (scrollY / scrollable) * 100));

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setScrollY(contentOffset.y);
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - END_TOLERANCE_PX) {
      setScrolledToEnd(true);
    }
  }, []);

  const onContentSizeChange = useCallback((_width: number, height: number) => setContentHeight(height), []);
  const onLayout = useCallback((event: LayoutChangeEvent) => setLayoutHeight(event.nativeEvent.layout.height), []);

  return {
    progress,
    reachedEnd: fits || scrolledToEnd,
    scrollProps: { onScroll, onContentSizeChange, onLayout, scrollEventThrottle: 16 },
  };
}
