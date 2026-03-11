interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      class={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
        active
          ? "bg-primary text-primary-content border-primary"
          : "bg-base-100 text-base-content border-base-content/20 hover:bg-base-200"
      }`}
    >
      {label}
    </button>
  );
}
