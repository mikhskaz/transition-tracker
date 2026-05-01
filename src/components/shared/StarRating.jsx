export default function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? 0 : n)}
          className={`text-xl leading-none transition-all ${
            n <= value
              ? 'text-ember-500'
              : 'text-cream-500 hover:text-cream-300'
          }`}
          aria-label={`${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
