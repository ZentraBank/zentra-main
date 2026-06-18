import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen"
    style={{
      backgroundImage: "url('/images/Background_1.png')",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    }}
    >
      <Sidebar />

      <div className="md:pl-64">
        <Topbar />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}