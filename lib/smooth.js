// The smoothing factor
const smoothing = 0.2;

// Properties of a line
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: (integer), angle: (integer) }
const line = (pointA, pointB) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};

// Create a function to calculate the position of the control point
// I:  - lineCalc (function)
//       I:  - pointA (array) [x, y]: coordinates
//           - pointB (array) [x, y]: coordinates
//       O:  - (object) { length: (integer), angle: (integer) }
//     - smooth (float)
// O:  - (function) closure
//       I:  - current (array) [x, y]: coordinates
//           - previous (array) [x, y]: coordinates
//           - next (array) [x, y]: coordinates
//           - reverse (boolean, optional): sets the direction
//       O:  - (array) [x,y]: coordinates
const controlPoint = (lineCalc, smooth) => (
  current,
  previous,
  next,
  reverse,
) => {
  // Replace 'previous' and 'next' with 'current'
  // if they don't exist
  // (when 'current' is the first or last point of the array)
  const p = previous || current;
  const n = next || current;

  // properties of the line between previous and next
  const l = lineCalc(p, n);

  // If is end-control-point, add PI to the angle to go backward
  const angle = l.angle + (reverse ? Math.PI : 0);
  const length = l.length * smooth;

  // The control point position is relative to the current point
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;

  return [x, y];
};

// Create a function to calculate a bezier curve command
// I:  - controlPoint (function)
//       I:  - current (array) [x, y]: current point coordinates
//           - previous (array) [x, y]: previous point coordinates
//           - next (array) [x, y]: next point coordinates
//           - reverse (boolean) to set the direction
// O:  - (function) closure
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) 'C x2,y2 x1,y1 x,y': cubic bezier command
const bezierCommand = controlPointCalc => (point, i, a) => {
  // start control point
  const [cpsX, cpsY] = controlPointCalc(a[i - 1], a[i - 2], point);
  // end control point
  const [cpeX, cpeY] = controlPointCalc(point, a[i - 1], a[i + 1], true);

  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

// Render the svg <path> element
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string): a svg path command like 'L x,y' or C x2,y2 x1,y1 x,y'
// O:  - (string): a Svg <path> element
export const svgPath = (points, command) => {
  return points.reduce(
    (acc, point, i, a) =>
      i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`,
    '',
  );
};

// Function composition

// Position of a control point
// I:  - current (array) [x, y]: coordinates
//     - previous (array) [x, y]: coordinates
//     - next (array) [x, y]: coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: coordinates
const controlPointCalc = controlPoint(line, smoothing);

// Bezier curve command
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': cubic bezier command
export const bezierCommandCalc = bezierCommand(controlPointCalc);
