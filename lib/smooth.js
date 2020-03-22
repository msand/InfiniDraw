// The smoothing factor
const smoothing = 0.2;

const controlPoint = (
  currentX,
  currentY,
  previousX = currentX,
  previousY = currentY,
  nextX = currentX,
  nextY = currentY,
  phase,
) => {
  // Replace 'previous' and 'next' with 'current'
  // if they don't exist
  // (when 'current' is the first or last point of the array)
  const lengthX = nextX - previousX;
  const lengthY = nextY - previousY;

  // properties of the line between previous and next
  const length = smoothing * Math.sqrt(lengthX * lengthX + lengthY * lengthY);
  const angle = Math.atan2(lengthY, lengthX) + phase;

  // The control point position is relative to the current point
  const x = currentX + Math.cos(angle) * length;
  const y = currentY + Math.sin(angle) * length;

  return [x, y];
};

const bezierCommandCalc = (a) => (i) => {
  const twoPreviousX = a[i - 4];
  const twoPreviousY = a[i - 3];
  const previousX = a[i - 2];
  const previousY = a[i - 1];
  const currentX = a[i];
  const currentY = a[i + 1];
  const nextX = a[i + 2];
  const nextY = a[i + 3];

  // start and end control points
  const [cpsX, cpsY] = controlPoint(
    previousX,
    previousY,
    twoPreviousX,
    twoPreviousY,
    currentX,
    currentY,
    0,
  );
  // If is end-control-point, add PI to the angle to go backward
  const [cpeX, cpeY] = controlPoint(
    currentX,
    currentY,
    previousX,
    previousY,
    nextX,
    nextY,
    Math.PI,
  );

  return `C${cpsX},${cpsY} ${cpeX},${cpeY} ${currentX},${currentY}`;
};

export default (arr) => {
  const {length} = arr;
  const result = [`M${arr[0]},${arr[1]}`];
  const command = bezierCommandCalc(arr);
  for (let i = 2; i < length; i += 2) {
    result.push(command(i));
  }
  return result.join('');
};
