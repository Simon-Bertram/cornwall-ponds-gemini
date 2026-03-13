import { useState } from "preact/hooks";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  title: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title,
}: BeforeAfterSliderProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  return (
    <div
      class="relative rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* ── BEFORE image (base layer, always full width) ── */}
      {beforeError ? (
        <div class="absolute inset-0 bg-linear-to-br from-base-content/90 to-base-content/70 flex items-center justify-center">
          <span class="text-base-100/60 font-serif text-lg">Before</span>
        </div>
      ) : (
        <img
          src={beforeImage}
          alt={`Before: ${title}`}
          class="absolute inset-0 w-full h-full object-cover"
          onError={() => setBeforeError(true)}
        />
      )}

      {/* ── AFTER image (clipped on top via clip-path) ── */}
      {afterError ? (
        <div
          class="absolute inset-0 bg-linear-to-br from-primary/80 to-accent/60 flex items-center justify-center"
          style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
        >
          <span class="text-white/70 font-serif text-lg">After</span>
        </div>
      ) : (
        <img
          src={afterImage}
          alt={`After: ${title}`}
          class="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - sliderValue}% 0 0)` }}
          onError={() => setAfterError(true)}
        />
      )}

      {/* ── Divider line ── */}
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none z-10"
        style={{ left: `${sliderValue}%` }}
        aria-hidden="true"
      />

      {/* ── Drag handle ── */}
      <div
        class="absolute top-1/2 z-20 pointer-events-none -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary border-2 border-white text-white flex items-center justify-center shadow-xl"
        style={{ left: `${sliderValue}%` }}
        aria-hidden="true"
      >
        {/* ←→ arrows */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 9l-4 3 4 3M16 9l4 3-4 3"
          />
        </svg>
      </div>

      {/* ── Before / After corner labels ── */}
      <span
        class="absolute bottom-4 left-4 z-10 text-xs font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded"
        aria-hidden="true"
      >
        Before
      </span>
      <span
        class="absolute bottom-4 right-4 z-10 text-xs font-bold uppercase tracking-widest text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded"
        aria-hidden="true"
      >
        After
      </span>

      {/* ── Range input: invisible, covers whole area, captures drag ── */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onInput={(e) =>
          setSliderValue(Number((e.target as HTMLInputElement).value))
        }
        class="peer absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        aria-label={`Before/after comparison for ${title}. Slide left or right.`}
        aria-describedby="before-after-instructions"
      />
      <div
        class="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-accent-foreground/80 ring-offset-2 ring-offset-base-content opacity-0 transition-opacity duration-150 peer-focus-visible:opacity-100"
        aria-hidden="true"
      />
    </div>
  );
}

