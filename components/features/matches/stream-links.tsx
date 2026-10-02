import { ExternalLink } from "lucide-react";
import type { MatchStream } from "@/lib/pandascore/streams";
import { cn } from "@/lib/utils";

const PLATFORM_LABEL: Record<MatchStream["platform"], string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  other: "Stream",
};

const PLATFORM_STYLE: Record<MatchStream["platform"], string> = {
  twitch: "border-[#9146ff]/40 bg-[#9146ff]/10 text-[#a970ff]",
  youtube: "border-[#ff0000]/40 bg-[#ff0000]/10 text-[#ff5c5c]",
  other: "border-white/20 bg-white/5 text-muted-foreground",
};

export function StreamLinks({ streams }: { streams: MatchStream[] }) {
  if (streams.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {streams.map((stream) => (
        <a
          key={stream.url}
          href={stream.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80",
            PLATFORM_STYLE[stream.platform]
          )}
        >
          {PLATFORM_LABEL[stream.platform]}
          {stream.language !== "?" && (
            <span className="uppercase opacity-70">{stream.language}</span>
          )}
          <ExternalLink className="size-3" />
        </a>
      ))}
    </div>
  );
}
