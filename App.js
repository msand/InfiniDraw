import { Svg, G, Path, Rect } from 'react-native-svg';

import DrawingComponentFactory from './lib/drawing';

const App = DrawingComponentFactory(Svg, G, Path, Rect);

export default App;
