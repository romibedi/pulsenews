export default function ControversyBadge({ score }) {
  if (score == null || score === 0) return null;

  let label, colorClass;
  if (score <= 20) { label = 'Low'; colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'; }
  else if (score <= 50) { label = 'Moderate'; colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'; }
  else if (score <= 75) { label = 'High'; colorClass = 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10'; }
  else { label = 'Very High'; colorClass = 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'; }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${colorClass}`} title={`Controversy score: ${score}/100`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      {label} controversy
    </span>
  );
}
