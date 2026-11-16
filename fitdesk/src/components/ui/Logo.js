import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../store/theme-context';
import { darkColors, radius, spacing } from '../../constants/theme';

const logoSource = require('../../../assets/logo.png');

// Proporção largura/altura do logo.png (1254 x 1254 = quadrado). É fixa de propósito:
// Image.resolveAssetSource não existe na web (react-native-web) e derrubava o app.
// Se trocar o arquivo por outro com proporção diferente, ajuste este valor.
const ASPECT_RATIO = 1;

// Logo do Fitdesk reutilizável.
// - height (opcional): altura da logo em pixels. A largura é calculada sozinha.
// - showName (opcional): mostra o texto "Fitdesk" ao lado do símbolo.
// - badge (opcional): coloca um selo escuro atrás da logo (ela foi feita para fundo escuro).
// - zoom (opcional): amplia a imagem dentro do selo para cortar a margem transparente.
// - style (opcional): estilos extras para o contêiner.
export default function Logo({ height = 32, showName = true, badge = true, zoom = 1.5, style }) {
  const { colors } = useTheme();
  const boxWidth = height * ASPECT_RATIO;

  const image = (
    <View style={{ height, width: boxWidth, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Image source={logoSource} style={{ height: height * zoom, width: boxWidth * zoom }} resizeMode="contain" />
    </View>
  );

  return (
    <View style={[styles.row, style]} accessible accessibilityRole="image" accessibilityLabel="Logo do Fitdesk">
      {badge ? <View style={styles.badge}>{image}</View> : image}
      {showName ? (
        <Text style={[styles.name, { color: colors.text, fontSize: height * 0.7 }]}>Fitdesk</Text>
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