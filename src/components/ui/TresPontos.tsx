/* Três pontos em triângulo — símbolo discreto inserido na marca PRIMUS */
export default function TresPontos({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex flex-col items-center gap-[2px] mx-[3px] opacity-60 ${className}`}
      aria-hidden="true"
    >
      <span className="flex gap-[3px]">
        <span className="w-[3px] h-[3px] rounded-full bg-[#f97316]" />
        <span className="w-[3px] h-[3px] rounded-full bg-[#f97316]" />
      </span>
      <span className="w-[3px] h-[3px] rounded-full bg-[#f97316]" />
    </span>
  );
}
