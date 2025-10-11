import { Suspense } from "react";
import AboutContentEditor from "@/components/admin/AboutContentEditor";

export default function AboutPageAdmin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutContentEditor />
    </Suspense>
  );
}