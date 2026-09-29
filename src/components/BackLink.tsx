import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function BackLink({
  to,
  onClick,
  children,
}: {
  to?: string;
  onClick?: () => void;
  children: string;
}) {
  const className = "inline-flex items-center gap-1.5 text-sm font-medium text-moss hover:underline";
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        <ArrowLeft size={16} />
        {children}
      </button>
    );
  }
  return (
    <Link to={to ?? "/"} className={className}>
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
