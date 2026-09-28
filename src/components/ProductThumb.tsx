import React, { useEffect, useState } from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon } from '../icons/Icon';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';
import { colors } from '../theme';

type Props = {
  imageUrl?: string | null;
  /** Container style from the calling screen — sets the size, background and corner radius. */
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
};

/** A product's photo, falling back to the package icon when there is none or it fails to load. */
export function ProductThumb({ imageUrl, style, iconSize = 20, iconColor = colors.textTertiary }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const showImage = !!imageUrl && !failed;

  return (
    <View style={[style, showImage && styles.clip]}>
      {showImage ? (
        <Image
          source={{ uri: resolveAssetUrl(imageUrl) }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon name="package" size={iconSize} color={iconColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
