/*
 * LogoPrimus — três pontos maçônicos via <ruby>:
 * ponto sobre o I de PRIMUS · ponto sobre o I de SGI · ponto final
 */
export default function LogoPrimus({
  textSize = "text-xl",
  className = "",
}: {
  textSize?: string;
  className?: string;
}) {
  const dot = (
    <rt
      style={{
        fontSize: "0.45em",
        color: "#f97316",
        lineHeight: 1,
        textAlign: "center",
        rubyAlign: "center" as never,
      }}
    >
      •
    </rt>
  );

  return (
    <span
      className={`font-bold tracking-wide inline-flex items-baseline leading-none ${textSize} ${className}`}
    >
      <span className="text-white">PRIM</span>
      <ruby className="text-white" style={{ rubyAlign: "center" } as never}>
        I{dot}
      </ruby>
      <span className="text-white">US</span>

      <span className="mx-1" />

      <span className="text-[#f97316]">SG</span>
      <ruby className="text-[#f97316]" style={{ rubyAlign: "center" } as never}>
        I{dot}
      </ruby>

      <span className="text-[#f97316]">.</span>
    </span>
  );
}
