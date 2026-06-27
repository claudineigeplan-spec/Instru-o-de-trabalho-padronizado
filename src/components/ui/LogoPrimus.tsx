/*
 * LogoPrimus — três pontos maçônicos visíveis:
 * ponto sobre o I de PRIMUS · ponto sobre o I de SGI · ponto final
 *
 * paddingTop no container cria espaço interno para os pontos,
 * evitando qualquer corte por overflow dos elementos pai.
 */
function IcomPonto({ color }: { color: string }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        color,
      }}
    >
      I
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-7px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: "#f97316",
          display: "block",
        }}
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
      className={`font-bold tracking-wide ${textSize} ${className}`}
      style={{ display: "inline-block", paddingTop: "10px", lineHeight: 1 }}
    >
      <span style={{ color: "#ffffff" }}>PRIM</span>
      <IcomPonto color="#ffffff" />
      <span style={{ color: "#ffffff" }}>US </span>
      <span style={{ color: "#f97316" }}>SG</span>
      <IcomPonto color="#f97316" />
      <span style={{ color: "#f97316" }}>.</span>
    </span>
  );
}
