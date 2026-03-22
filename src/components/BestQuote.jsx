export default function BestQuote({ quote }) {
  if (!quote) return null;

  return (
    <div className="my-8 relative">
      <div className="absolute -top-3 left-4 w-8 h-8 flex items-center justify-center bg-[#e05d44] dark:bg-[#e87461] rounded-full">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <blockquote className="pl-6 pr-4 py-5 bg-gradient-to-r from-[#fef0ed]/50 to-transparent dark:from-[#e87461]/5 dark:to-transparent border-l-3 border-[#e05d44] dark:border-[#e87461] rounded-r-xl">
        <p className="text-base italic text-[var(--text)] leading-relaxed">{quote}</p>
      </blockquote>
    </div>
  );
}
