export const dynamic = "force-dynamic";
export const revalidate = 0;

import Terms from "@/components/main/Terms";

export default async function TermsPage({}) {
  return (
    <main className="container-md section-md">
      <Terms />
    </main>
  );
}
