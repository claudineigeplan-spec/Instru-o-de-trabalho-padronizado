/*
 * LogoPrimus — marca PRIMUS SGI com três pontos maçônicos:
 * ponto sobre o I de PRIMUS · ponto sobre o I de SGI · ponto final
 */

function LetraI({ color = "text-white" }: { color?: string }) {
  return (
    <span className={`relative inline-block ${color}`}>
      I
      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#f97316] pointer-events-none select-none"
        style={{ width: "5px", height: "5px", bottom: "100%", marginBottom: "0.08em" }}
      />
    </span>
  );
}

export default function LogoPrimus({
  textSize = "text-xl",
  className = "",
}: {
  textSize?: string;
  className?: string;
}) {
  return (
    <span
      className={`font-bold tracking-wide inline-flex items-baseline leading-none ${textSize} ${className}`}
    >
      {/* PRIMUS com ponto sobre o I */}
      <span className="text-white">PRIM</span>
      <LetraI />
      <span className="text-white">US</span>

      <span className="mx-1" />

      {/* SGI com ponto sobre o I */}
      <span className="text-[#f97316]">SG</span>
      <LetraI color="text-[#f97316]" />

      {/* ponto final */}
      <span className="text-[#f97316]">.</span>
    </span>
  );
}
