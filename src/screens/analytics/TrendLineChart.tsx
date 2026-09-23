import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';
import { colors, radii } from '../../theme';

type Props = {
  data: number[];
  height?: number;
  color?: string;
};

export function TrendLineChart({ data, height = 100, color = colors.primary }: Props) {
  const [width, setWidth] = React.useState(0);

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const toPoint = (value: number, index: number) => {
    const x = index * stepX;
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return { x, y };
  };

  const points = data.map((value, index) => toPoint(value, index));
  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    width > 0
      ? `M0,${height} L${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')} L${width},${height} Z`
      : '';

  return (
    <View
      style={{ width: '100%', height, borderRadius: radii.md, overflow: 'hidden' }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.18} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#trendFill)" />
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}
