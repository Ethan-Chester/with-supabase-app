import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

export default function Page() {
    // Maybe add light/dark theme toggle?



  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* header + breadcrumb */}
       <header className="flex h-16 shrink-0 items-center border-b px-3 justify-between">
        <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
        </div>
        {/* logo */}
        <img src="/pc_logo.png" alt="ProcessCoach logo" className="h-8 w-auto" />
        </header>
        <div className="p-4">
            <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
