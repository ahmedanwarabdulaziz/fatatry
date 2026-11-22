import { redirect } from "next/navigation";

// /admin has no page of its own; send signed-in users to the dashboard
export default function AdminIndex() {
    redirect("/admin/dashboard");
}
