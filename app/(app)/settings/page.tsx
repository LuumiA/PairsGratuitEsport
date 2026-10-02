import { requireProfile } from "@/lib/data/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarUploader } from "@/components/features/settings/avatar-uploader";
import { ProfileForm } from "@/components/features/settings/profile-form";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const profile = await requireProfile();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Paramètres du profil</h1>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>PNG, JPG ou WebP, 2 Mo max.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUploader
            userId={profile.id}
            username={profile.username}
            avatarUrl={profile.avatar_url}
          />
        </CardContent>
      </Card>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle>Pseudo et bio</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm username={profile.username} bio={profile.bio} />
        </CardContent>
      </Card>
    </div>
  );
}
