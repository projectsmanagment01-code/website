import { GoogleTagManager } from '@next/third-parties/google';
import { getAdminSettings } from '@/lib/admin-settings';

export default async function GoogleTagManagerComponent() {
  const settings = await getAdminSettings();
  const gtmId = settings.googleTagManagerId;

  if (!gtmId) {
    return null;
  }

  return <GoogleTagManager gtmId={gtmId} />;
}
