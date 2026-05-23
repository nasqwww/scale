import { motion } from 'framer-motion';
import { Ruler, Zap } from 'lucide-react';
import type { ScaleObject } from '../types';
import { axisCopy, formatMeters } from '../lib/format';
import { sliderToValue, valueToSlider } from '../lib/slider';

interface ScaleSliderProps {
  object: ScaleObject;
  value: number;
  disabled: boolean;
  charging: boolean;
  onChange: (value: number) => void;
  onLock: () => void;
}

export function ScaleSlider({ object, value, disabled, charging, onChange, onLock }: ScaleSliderProps) {
  const sliderValue = valueToSlider(value, object.minGuessMeters, object.maxGuessMeters);

  return (
    <section className="control-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="kicker">Estimate {object.axis}</p>
          <h3 className="mt-2 max-w-3xl text-balance text-2xl font-semibold text-white sm:text-3xl">
            {object.prompt}
          </h3>
        </div>
        <div className="readout">
          <Ruler size={18} />
          <span>{formatMeters(value)}</span>
        </div>
      </div>

      <div className="mt-7">
        <input
          aria-label={`Guess ${object.axis} in meters`}
          className="scale-slider"
          disabled={disabled}
          max={100}
          min={0}
          step={0.05}
          type="range"
          value={sliderValue}
          onChange={(event) => onChange(sliderToValue(Number(event.target.value), object.minGuessMeters, object.maxGuessMeters))}
        />
        <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.14em] text-white/[0.42]">
          <span>{formatMeters(object.minGuessMeters)}</span>
          <span>{axisCopy(object.axis)}</span>
          <span>{formatMeters(object.maxGuessMeters)}</span>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-white/[0.56]">{object.intro}</p>
        <motion.button
          className="primary-action min-h-[52px] justify-center px-6"
          type="button"
          onClick={onLock}
          disabled={disabled}
          whileTap={{ scale: 0.98 }}
        >
          <Zap size={18} />
          {charging ? 'Calibrating...' : 'Lock measurement'}
        </motion.button>
      </div>
    </section>
  );
}
