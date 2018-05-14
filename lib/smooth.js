// The smoothing factor
const smoothing = 0.2;

const controlPoint = (
  currentX,
  currentY,
  previousX = currentX,
  previousY = currentY,
  nextX = currentX,
  nextY = currentY,
  reverse,
) => {
  // Replace 'previous' and 'next' with 'current'
  // if they don't exist
  // (when 'current' is the first or last point of the array)
  const lengthX = nextX - previousX;
  const lengthY = nextY - previousY;

  // properties of the line between previous and next
  const length = smoothing * Math.sqrt(lengthX * lengthX + lengthY * lengthY);

  // If is end-control-point, add PI to the angle to go backward
  const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0);

  // The control point position is relative to the current point
  const x = currentX + Math.cos(angle) * length;
  const y = currentY + Math.sin(angle) * length;

  return [x, y];
};

const bezierCommandCalc = a => i => {
  const twoPreviousX = a[i - 4],
    twoPreviousY = a[i - 3],
    previousX = a[i - 2],
    previousY = a[i - 1],
    currentX = a[i],
    currentY = a[i + 1],
    nextX = a[i + 2],
    nextY = a[i + 3];

  // start and end control points
  const [cpsX, cpsY] = controlPoint(
    previousX,
    previousY,
    twoPreviousX,
    twoPreviousY,
    currentX,
    currentY,
  );
  const [cpeX, cpeY] = controlPoint(
    currentX,
    currentY,
    previousX,
    previousY,
    nextX,
    nextY,
    true,
  );

  return `C${cpsX},${cpsY} ${cpeX},${cpeY} ${currentX},${currentY}`;
};

export default arr => {
  const length = arr.length;
  const result = [`M${arr[0]},${arr[1]}`];
  const command = bezierCommandCalc(arr);
  for (let i = 2; i < length; i += 2) {
    result.push(command(i));
  }
  return result.join('');
};
