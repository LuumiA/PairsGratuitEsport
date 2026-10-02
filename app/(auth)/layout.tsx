import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center text-2xl font-bold tracking-tight text-gradient-neon"
        >
          PairsGratuitEsport
        </Link>
        {children}
      </div>
    </div>
  );
}
