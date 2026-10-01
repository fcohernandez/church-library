import { Library } from 'lucide-react'

export function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-brand-600">
          <Library className="h-6 w-6" />
          <h1 className="text-lg font-semibold text-slate-900">Configuración pendiente</h1>
        </div>
        <p className="text-sm text-slate-600">
          Falta configurar la conexión con Supabase. Crea un archivo{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">.env</code> en la raíz del proyecto (puedes
          copiar <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">.env.example</code>) con:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
        </pre>
        <p className="mt-3 text-sm text-slate-600">
          Luego reinicia el servidor de desarrollo. Revisa el <strong>README.md</strong> para instrucciones completas
          de configuración de la base de datos.
        </p>
      </div>
    </div>
  )
}
