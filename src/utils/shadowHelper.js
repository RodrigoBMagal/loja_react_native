/**
 * Converte propriedades de sombra React Native para boxShadow CSS compatível com web
 * @param {Object} shadowProps - Objeto com shadowColor, shadowOffset, shadowOpacity, elevation
 * @returns {Object} Objeto com boxShadow ou {} para fallback
 */
export const createShadowStyle = ({ shadowColor, shadowOffset, shadowOpacity, elevation }) => {
  if (!shadowColor || !shadowOffset || shadowOpacity === undefined) {
    return {};
  }

  // Converte rgba para valores decimais (ex: #000 -> rgba(0,0,0,opacity))
  const parseColor = (color) => {
    if (!color) return 'rgba(0,0,0,0.3)';
    
    // Se for hex
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r},${g},${b}`;
    }
    return color;
  };

  const color = parseColor(shadowColor);
  const offsetX = shadowOffset.width || 0;
  const offsetY = shadowOffset.height || 2;
  const blur = elevation ? elevation * 2 : 4;
  const spread = 0;
  const opacity = shadowOpacity || 0.3;

  // Formato: offsetX offsetY blur spread color
  const boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}, ${opacity})`;
  
  return { boxShadow };
};

/**
 * Combina estilos normais com sombra convertida
 */
export const withShadow = (baseStyle) => {
  const { shadowColor, shadowOffset, shadowOpacity, elevation, ...rest } = baseStyle;
  
  const shadowStyle = createShadowStyle({ shadowColor, shadowOffset, shadowOpacity, elevation });
  
  return {
    ...rest,
    ...shadowStyle,
  };
};
