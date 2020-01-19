const rangeMap = (value, inMin, inMax, outMin, outMax) => ((value - inMin) * (outMax - outMin)) / ((inMax - inMin) + outMin);

export default rangeMap;
