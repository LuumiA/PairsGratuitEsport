import { History } from "lucide-react";
import { getMyBets } from "@/lib/data/bets";
import { BetsHistoryList } from "@/components/features/bets/bets-history-list";

export const metadata = { title: "Mes paris" };

export default async function BetsPage() {
  const bets = await getMyBets();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="size-6 text-neon-violet" />
        <h1 className="text-2xl font-bold">Mes paris</h1>
      </div>

      <BetsHistoryList bets={bets} />
    </div>
  );
}
