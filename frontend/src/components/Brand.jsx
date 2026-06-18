import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand({ compact = false }) {
  return (
    <Link className="inline-flex items-center gap-3" to="/">
      <span className="grid size-10 place-items-center rounded-full bg-brand-500 text-white shadow-glow">
        <Zap className="size-5" />
      </span>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-white">
          Fit<span className="text-brand-400">Connection</span>
        </span>
      )}
    </Link>
  );
}
