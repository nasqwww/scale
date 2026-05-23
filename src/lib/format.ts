import type { MeasurementAxis, ScaleComparison } from '../types';

const axisNouns: Record<MeasurementAxis, string> = {
  height: 'tall',
  length: 'long',
  diameter: 'wide',
  span: 'across',
};

export function formatMeters(meters: number): string {
  if (meters < 1) {
    return `${Math.round(meters * 100)} cm`;
  }

  if (meters < 10) {
    return `${meters.toFixed(2).replace(/\.?0+$/, '')} m`;
  }

  if (meters < 1000) {
    return `${meters.toFixed(meters < 100 ? 1 : 0).replace(/\.0$/, '')} m`;
  }

  return `${(meters / 1000).toFixed(2).replace(/\.?0+$/, '')} km`;
}

export function axisCopy(axis: MeasurementAxis): string {
  return axisNouns[axis];
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function describeComparison(correctMeters: number, comparisons: ScaleComparison[]): string {
  const best = comparisons
    .map((comparison) => ({
      comparison,
      count: correctMeters / comparison.meters,
      distance: Math.abs(Math.log10(Math.max(correctMeters / comparison.meters, 0.01))),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (!best) {
    return `Real size: ${formatMeters(correctMeters)}.`;
  }

  const rounded = best.count < 1 ? Number(best.count.toFixed(1)) : Math.round(best.count);
  const unit = Math.abs(rounded - 1) < 0.05 ? best.comparison.singular : best.comparison.plural;

  if (best.count < 0.75) {
    return `About ${formatMeters(correctMeters)}, less than one ${best.comparison.singular}.`;
  }

  return `Equivalent to about ${rounded} ${unit}.`;
}
