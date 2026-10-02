"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, Home, Swords, Brain, Users, Trophy, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/matches", label: "Matchs", icon: Swords },
  { href: "/quiz", label: "Quiz", icon: Brain },
  { href: "/groups", label: "Groupes", icon: Users },
  { href: "/leaderboard", label: "Classement", icon: Trophy },
];

type NavProfile = {
  username: string;
  avatar_url: string | null;
  points_balance: number;
  is_admin: boolean;
};

export function AppNav({ profile }: { profile: NavProfile }) {
  const pathname = usePathname();

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-0/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-gradient-neon">
          PairsGratuitEsport
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted-foreground hover:bg-surface-1 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="gap-1.5 border-neon-violet/40 bg-neon-violet/10 px-2.5 py-1 text-sm font-semibold text-foreground"
          >
            <Coins className="size-3.5 text-neon-violet" />
            {profile.points_balance.toLocaleString("fr-FR")}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none ring-primary/50 focus-visible:ring-2">
              <Avatar className="size-9">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
                <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link href={`/profile/${profile.username}`} />}>
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}>Paramètres</DropdownMenuItem>
              {profile.is_admin && (
                <DropdownMenuItem render={<Link href="/admin/quiz" />} className="gap-2">
                  <Shield className="size-4" /> Administration
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-surface-0/90 backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              active ? "text-neon-cyan" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
    </>
  );
}
