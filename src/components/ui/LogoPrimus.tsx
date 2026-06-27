/*
 * LogoPrimus — três pontos maçônicos:
 * • sobre o I de PRIMUS · • sobre o I de SGI · ponto final
 */
function Idot({ white }: { white?: boolean }) {
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      <span style={{ color: white ? "#ffffff" : "#f97316" }}>I</span>
      <sup
        style={{
          fontSize: "0.55em",
          lineHeight: 0,
          color: "#f97316",
          fontWeight: "bold",
        }}
      >
        •
      </sup>
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
      className={`font-bold tracking-wide inline-flex items-baseline ${textSize} ${className}`}
    >
      <span style={{ color: "#ffffff" }}>PRIM</span>
      <Idot white />
      <span style={{ color: "#ffffff" }}>US </span>
      <span style={{ color: "#f97316" }}>SG</span>
      <Idot />
      <span style={{ color: "#f97316" }}>.</span>
    </span>
  );
}
