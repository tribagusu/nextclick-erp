/**
 * Auth Layout
 *
 * Layout for authentication pages with centered content.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
