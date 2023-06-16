export const getGraphPath = (points, command, smoothing = 0) => {
  if (!points || !points.length) {return ''}
  return points.reduce((memo, point, i, a) => {
    return i === 0
      ? `M ${point[0]},${point[1]}`
      : `${memo} ${command(point, i, a, smoothing)}`
  }, '')
}

export const line = (pointA, pointB) => {
  const lengthX = pointB[0] - pointA[0]
  const lengthY = pointB[1] - pointA[1]
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  }
}

export const controlPoint = (lineCalc) => (current, previous, next, smoothing, reverse) => {
  // Replace 'previous' and 'next' with 'current'
  // if they don't exist
  // (when 'current' is the first or last point of the array)
  const p = previous || current
  const n = next || current

  // properties of the line between previous and next
  const l = lineCalc(p, n)

  // If is end-control-point, add PI to the angle to go backward
  const angle = l.angle + (reverse ? Math.PI : 0)
  const length = l.length * smoothing

  // The control point position is relative to the current point
  const x = current[0] + Math.cos(angle) * length
  const y = current[1] + Math.sin(angle) * length

  return [x, y]
}

export const bezierCommand = (controlPointCalc) => (point, i, a, smoothing) => {
  // start control point
  const [cpsX, cpsY] = controlPointCalc(a[i - 1], a[i - 2], point, smoothing)
  // end control point
  const [cpeX, cpeY] = controlPointCalc(point, a[i - 1], a[i + 1], smoothing, true)

  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`
}

export const controlPointCalc = controlPoint(line)

export const bezierCommandCalc = bezierCommand(controlPointCalc)
