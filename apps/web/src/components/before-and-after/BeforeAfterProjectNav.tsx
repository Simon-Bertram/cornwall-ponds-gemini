interface BeforeAfterProjectNavProps {
  title: string;
  location: string;
  hasMultipleProjects: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export default function BeforeAfterProjectNav({
  title,
  location,
  hasMultipleProjects,
  onPrev,
  onNext,
}: BeforeAfterProjectNavProps) {
  return (
    <div class="flex items-center justify-between mt-6 gap-4">
      {/* Prev */}
      {hasMultipleProjects && (
        <button
          onClick={onPrev}
          class="flex items-center gap-1.5 text-base-100/75 hover:text-base-100 transition-colors duration-200 text-sm font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-content rounded-sm py-1"
          aria-label="Previous project transformation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Prev
        </button>
      )}

      {/* Title + location */}
      <div class="text-center flex-1 min-w-0 px-2">
        <p class="font-serif text-xl font-bold text-base-100 truncate">
          {title}
        </p>
        <p class="text-base-100/70 text-sm mt-0.5">
          {location}, Cornwall
        </p>
      </div>

      {/* Next */}
      {hasMultipleProjects && (
        <button
          onClick={onNext}
          class="flex items-center gap-1.5 text-base-100/75 hover:text-base-100 transition-colors duration-200 text-sm font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-content rounded-sm py-1"
          aria-label="Next project transformation"
        >
          Next
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

