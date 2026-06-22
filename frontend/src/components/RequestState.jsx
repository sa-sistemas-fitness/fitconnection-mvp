import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import { Button, Card } from "./ui.jsx";

export function LoadingState({ label = "Cargando información..." }) {
  return (
    <Card className="grid min-h-56 place-items-center p-8">
      <div className="text-center text-slate-400">
        <LoaderCircle className="mx-auto size-8 animate-spin text-blue-400" />
        <p className="mt-3">{label}</p>
      </div>
    </Card>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Card className="grid min-h-56 place-items-center border-rose-500/20 p-8">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto size-9 text-rose-400" />
        <h3 className="mt-4 text-xl font-bold">No pudimos cargar esta sección</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
        {onRetry && (
          <Button className="mt-5" onClick={onRetry} variant="secondary">
            <RefreshCw className="size-4" /> Reintentar
          </Button>
        )}
      </div>
    </Card>
  );
}
