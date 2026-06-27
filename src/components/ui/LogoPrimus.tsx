/*
 * LogoPrimus — marca PRIMUS SGI com os três pontos maçônicos sobre o I.
 * O ponto do I é o vértice inferior do triângulo; os dois superiores completam o ∴
 */
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
      <span className="text-white">PRIM</span>

      {/* I com o triângulo maçônico */}
      <span className="relative inline-block text-white">
        I
        <span
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none"
          style={{ bottom: "100%", marginBottom: "0.12em", gap: "3px" }}
        >
          {/* dois pontos superiores — mais discretos */}
          <span className="flex" style={{ gap: "5px" }}>
            <span
              className="rounded-full bg-[#f97316]"
              style={{ width: "3px", height: "3px", opacity: 0.45 }}
            />
            <span
              className="rounded-full bg-[#f97316]"
              style={{ width: "3px", height: "3px", opacity: 0.45 }}
            />
          </span>
          {/* ponto inferior — o "ponto do I", levemente maior */}
          <span
            className="rounded-full bg-[#f97316]"
            style={{ width: "4px", height: "4px", opacity: 0.8 }}
          />
        </span>
      </span>

      <span className="text-white">US</span>
      <span className="text-[#f97316] ml-1">SGI</span>
    </span>
  );
}
