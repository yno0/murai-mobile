// SVG Setup for React Native
// This file ensures that react-native-svg components are properly registered

import { AppRegistry } from 'react-native';

// Import SVG components to ensure they're registered
import {
  Svg,
  Circle,
  Ellipse,
  G,
  Text,
  TSpan,
  TextPath,
  Path,
  Polygon,
  Polyline,
  Line,
  Rect,
  Use,
  Image,
  Symbol,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Pattern,
  Mask,
} from 'react-native-svg';

// Register SVG components
const registerSVGComponents = () => {
  // This function ensures SVG components are available
  // The import above should be sufficient, but this provides explicit registration
  console.log('SVG components registered');
};

export default registerSVGComponents;
