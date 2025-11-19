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
import { Plus, ChevronRight } from "lucide-react";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
// mock plays data TODO: connect page with supabase to CRUD
  const plays = [
    { id: "1", name: "Client Quarterly Check-In" },
    { id: "2", name: "Email Sending and Processing Play" },
    { id: "3", name: "Stephen Prod Testing Play" },
    { id: "4", name: "New Client Onboarding Workflow" },
    { id: "5", name: "Employee Onboarding Sequence" },
    { id: "6", name: "Invoice Review and Approval Play" },
    { id: "7", name: "Weekly Social Media Publishing" },
    { id: "8", name: "Lead Qualification and Routing" },
    { id: "9", name: "Contract Review and Signature" },
    { id: "10", name: "Monthly Financial Reporting" },
    { id: "11", name: "Customer Support Ticket Escalation" },
    { id: "12", name: "Vendor Payment Processing" },
    { id: "13", name: "Marketing Campaign Launch Checklist" },
    { id: "14", name: "Website Content Update Workflow" },
    { id: "15", name: "Performance Review Preparation" },
    { id: "16", name: "IT Access Provisioning Play" },
    { id: "17", name: "Client Offboarding Procedure" },
    { id: "18", name: "Data Backup and Compliance Check" },
    { id: "19", name: "Quarterly KPI Review Workflow" },
    { id: "20", name: "Sales Proposal Creation Play" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* sidebar + breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b justify-between mr-4">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <AppBreadcrumb />
          </div>
          {/* logo */}
          <div>
            <img
              src="/pc_logo.png"
              alt="ProcessCoach logo"
              className="h-8 w-auto"
            />
          </div>
        </header>

        {/* title */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <RevealLine delay={0}>Plays</RevealLine>
            </h1>
            <h2 className="font-medium text-muted-foreground">
              <RevealLine delay={140}>
                Manage and monitor your business plays
              </RevealLine>
            </h2>
          </div>
          <RevealLine delay={220} className="inline-block">
            <Button
              size="sm"
              className="bg-sidebar text-white py-5"
              asChild
            >
              <Link href="/roles" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Play
              </Link>
            </Button>
          </RevealLine>
        </div>

        {/* main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card
            className="card-pop flex flex-1 flex-col rounded-xl"
            style={{ animationDelay: "260ms" }}
          >
            <CardHeader className="pb-3 px-6">
              <CardTitle className="text-base">
                <RevealLine delay={300}>Available Plays</RevealLine>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0 px-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="px-0">Play</TableHead>
                    <TableHead className="px-0 text-right w-32">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {plays.map((play, index) => {
                    const baseDelay = 340 + index * 40; // edit *X to change stagger speed
                    return (
                      <TableRow
                        key={play.id}
                        className="
                          group
                          hover:bg-muted/40
                          transition-colors
                          border-0
                          border-b 
                          border-border/40
                          last:border-b-0
                        "
                      >
                        {/* green slider */}
                        <TableCell className="px-0 py-2.5 font-medium">
                          <RevealLine delay={baseDelay}>
                            <span className="relative group inline-block">
                              {play.name}
                              <span
                                className="
                                  absolute 
                                  left-0
                                  bottom-0        
                                  h-[2px]
                                  bg-emerald-600
                                  w-0
                                  origin-left
                                  transition-all duration-300 ease-out
                                  group-hover:w-full
                                "
                              />
                            </span>
                          </RevealLine>
                        </TableCell>

                        {/* details button */}
                        <TableCell className="px-0 py-2.5 text-right">
                          <RevealLine delay={baseDelay + 60}>
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/playpage/${play.id}`}
                                className="flex items-center gap-1"
                              >
                                View Details
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            </Button>
                          </RevealLine>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

