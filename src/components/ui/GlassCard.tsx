interface Props {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${onClick ? "cursor-pointer hover:bg-white/10 transition-colors" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
