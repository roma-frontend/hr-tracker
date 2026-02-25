import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: {
    default: "Dashboard | HR Office",
    template: "%s | HR Office",
  },
  description: "HR Office - Manage attendance, leaves, tasks and employees in real-time.",
  robots: { index: false, follow: false },
};

// Server-side auth guard — second layer of protection after middleware
async function requireAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    redirect("/auth/login");
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(session));
    if (!parsed?.id && !parsed?._id) {
      redirect("/auth/login");
    }
    return parsed;
  } catch {
    redirect("/auth/login");
  }
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAuth();

  return (
    <Providers>
      {children}
    </Providers>
  );
}
