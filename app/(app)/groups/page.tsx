import { Users } from "lucide-react";
import { getMyGroups } from "@/lib/data/groups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateGroupForm } from "@/components/features/groups/create-group-form";
import { JoinGroupForm } from "@/components/features/groups/join-group-form";
import { GroupCard } from "@/components/features/groups/group-card";

export const metadata = { title: "Groupes" };

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const groups = await getMyGroups();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Users className="size-6 text-neon-violet" />
        <h1 className="text-2xl font-bold">Mes groupes</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Créer un groupe</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateGroupForm />
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader>
            <CardTitle>Rejoindre un groupe</CardTitle>
          </CardHeader>
          <CardContent>
            <JoinGroupForm defaultCode={code} />
          </CardContent>
        </Card>
      </div>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Tu ne fais partie d&apos;aucun groupe pour le moment.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}
