"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Legacy list detail route — redirects to the new Keep-style list editor at /vault/lists/[id]
 */
export default function LegacyListRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params.id as string;
    router.replace(`/vault/lists/${id}`);
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
}
