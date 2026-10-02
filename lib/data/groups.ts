import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface GroupSummary {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  tournament_start: string | null;
  tournament_end: string | null;
  created_at: string;
  member_count: number;
}

export async function getMyGroups(): Promise<GroupSummary[]> {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, owner_id, invite_code, tournament_start, tournament_end, created_at")
    .order("created_at", { ascending: false });

  if (!groups?.length) return [];

  const { data: members } = await supabase
    .from("group_members")
    .select("group_id")
    .in(
      "group_id",
      groups.map((g) => g.id)
    );

  const counts = new Map<string, number>();
  for (const m of members ?? []) counts.set(m.group_id, (counts.get(m.group_id) ?? 0) + 1);

  return groups.map((g) => ({ ...g, member_count: counts.get(g.id) ?? 0 }));
}

export interface GroupMemberRow {
  user_id: string;
  username: string;
  avatar_url: string | null;
  points_delta: number;
}

export async function getGroupDetail(groupId: string) {
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, owner_id, invite_code, tournament_start, tournament_end, created_at")
    .eq("id", groupId)
    .single();

  if (!group) return null;

  const { data: leaderboard } = await supabase.rpc("get_group_leaderboard", {
    p_group_id: groupId,
  });

  return { group, leaderboard: (leaderboard ?? []) as GroupMemberRow[] };
}
