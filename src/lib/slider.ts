export function valueToSlider(value: number, min: number, max: number): number {
  const clamped = Math.min(max, Math.max(min, value));
  return ((Math.log(clamped) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 100;
}

export function sliderToValue(sliderValue: number, min: number, max: number): number {
  const t = Math.min(100, Math.max(0, sliderValue)) / 100;
  return Math.exp(Math.log(min) + t * (Math.log(max) - Math.log(min)));
}
