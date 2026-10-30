import { SvgXml } from 'react-native-svg';

import { figmaIcons } from '../assets/figma/icons';

export type FigmaIconName = keyof typeof figmaIcons;

export function FigmaIcon({
  name,
  size,
  width,
  height,
  color,
}: {
  name: FigmaIconName;
  size?: number;
  width?: number;
  height?: number;
  /** Overrides the icon's baked-in fill/stroke color (each source icon uses a single flat color). */
  color?: string;
}) {
  const xml = color ? figmaIcons[name].replace(/#[0-9A-Fa-f]{6}/g, color) : figmaIcons[name];
  return <SvgXml xml={xml} width={width ?? size} height={height ?? size} />;
}
