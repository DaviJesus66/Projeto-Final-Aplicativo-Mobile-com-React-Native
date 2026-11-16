
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../store/theme-context';
import { darkColors, radius, spacing } from '../../constants/theme';

const logoSource = require('../../../assets/logo.png');

// Proporção fixa para evitar incompatibilidade com React Native Web.
const ASPECT_RATIO = 1;

export default function Logo({
  height = 32,
  showName = true,
  badge = true,
  zoom = 1.5,
  style,
}) {
  const { colors } = useTheme();
  const boxWidth = height * ASPECT_RATIO;

  const image = (
    <View
      style={{
        height,
        width: boxWidth,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={logoSource}
        style={{
          height: height * zoom,
          width: boxWidth * zoom,
        }}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Logo do Fitdesk"
    >
      {badge ? <View style={styles.badge}>{image}</View> : image}

      {showName ? (
        <Text
          style={[
            styles.name,
            { color: colors.text, fontSize: height * 0.7 },
          ]}
        >
          Fitdesk
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: darkColors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  name: {
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
});
