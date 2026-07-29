import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { SettingsManager } from "@/src/components/settings/settings-manager";

export default function SettingsPage() {
  return (
    <ProtectedRoute permission="platform.settings.read">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold">
          Platform settings
        </h1>

        <SettingsManager />
      </main>
    </ProtectedRoute>
  );
}
