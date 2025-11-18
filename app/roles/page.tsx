import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import React from "react";


// mock job decription data TODO: connect page with supabase to CRUD
const jobDescriptions = [
  {
    id: "1",
    title: "Business Analyst",
    description:
      "The Business Analyst works with clients to understand their needs and document them in a way that the technical team can understand what needs to be…",
  },
  {
    id: "2",
    title: "Story teller",
    description:
      "Responsible for developing storylines and telling bedtime stories.",
  },
  {
    id: "3",
    title: "Payroll Admin",
    description: "Responsible for running payroll and approving expenses.",
  },
  {
    id: "4",
    title: "ProcessCoach",
    description:
      "The individuals who will advise organizations about how best to use AI in their business.",
  },
  {
    id: "5",
    title: "HR Rep",
    description:
      "Takes care of tasks related to on-boarding and off-boarding.",
  },
  {
    id: "6",
    title: "IT",
    description:
      "Helps reformat laptop computers and logs team members in and out of software.",
  },
  {
    id: "7",
    title: "Commission Reviewer",
    description:
      "Responsible for reviewing and approving all commission payouts.",
  },
  {
    id: "8",
    title: "Sales Rep",
    description:
      "Manages the sales and client acquisition process for new clients.",
  },
  {
    id: "9",
    title: "Client Account Manager",
    description:
      "Client success owner who serves as the liaison between ProcessCoach, development team, and the client.",
  },
];

// reveal anim

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

function RevealLine({ children, delay = 0, className = "" }: RevealProps) {
  return (
    <span className={`reveal-mask ${className}`}>
      <span
        className="reveal-slide-up"
        style={{ animationDelay: `${delay}ms` }}
      >
        {children}
      </span>
    </span>
  );
}

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* header + breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
          </div>
        </header>

        {/* title */}
        <div className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">
              <RevealLine delay={0}>Job Descriptions</RevealLine>
            </h1>
            <h2 className="font-medium text-muted-foreground">
              <RevealLine delay={120}>
                Manage your job descriptions and assignment strategies
              </RevealLine>
            </h2>
          </div>

          <RevealLine delay={220} className="inline-block">
            <Button
              variant="outline"
              size="sm"
              className="bg-sidebar text-white py-5"
              asChild
            >
              <Link href="/roles" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Job Description
              </Link>
            </Button>
          </RevealLine>
        </div>

        {/* cards grid */}
        <main className="px-4 pb-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobDescriptions.map((job, index) => {
              const baseDelay = 150 + index * 90; 
              return (
                <div
                  key={job.id}
                  className="card-pop"
                  style={{ animationDelay: `${baseDelay}ms` }}
                >
                  <Card className="flex h-full flex-col justify-between shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex flex-col gap-1">
                        <RevealLine delay={baseDelay + 60}>
                          <span className="text-sm font-semibold">
                            {job.title}
                          </span>
                        </RevealLine>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col justify-between gap-4">
                      <RevealLine delay={baseDelay + 140}>
                        <p className="text-sm text-muted-foreground">
                          {job.description}
                        </p>
                      </RevealLine>

                      <div className="mt-2 flex items-center justify-between">
                        <RevealLine delay={baseDelay + 200}>
                          <span className="text-xs text-muted-foreground">
                            No assigned users
                          </span>
                        </RevealLine>

                        <div className="flex items-center gap-2">
                          <RevealLine delay={baseDelay + 240}>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </RevealLine>
                          <RevealLine delay={baseDelay + 280}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </RevealLine>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
