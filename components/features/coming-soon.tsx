import { type LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-neon-violet/10 text-neon-violet">
        <Icon className="size-7" />
      </div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
