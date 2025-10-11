export const dynamic = "force-dynamic";
export const revalidate = 0;

import Privacy from "@/components/main/Privacy";

export default async function PrivacyPage({}) {
  return (
    <main className="container-md section-md">
      <Privacy />
    </main>
  );
}
