export const dynamic = "force-static";

import Cookies from "@/components/main/Cookies";

export default async function CookiesPage({}) {
  return (
    <main className="container-md section-md">
      <Cookies />
    </main>
  );
}
