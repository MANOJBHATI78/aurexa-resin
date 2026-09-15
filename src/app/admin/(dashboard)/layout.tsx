import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin — Aurexa Resin CMS",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell user={{ name: session.name, email: session.email, role: session.role }}>
      {children}
    </AdminShell>
  );
}
