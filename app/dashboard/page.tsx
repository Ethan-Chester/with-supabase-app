import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2, BarChart2, CirclePlay, FileText } from "lucide-react";
import Link from "next/link";
import React from "react";

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
        <header className="flex h-16 shrink-0 items-center border-b px-3 justify-between mr-4">
          <div className="flex items-center gap-2">
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
        <div className="p-4 space-y-1">
          <h1 className="text-2xl font-bold">
            <RevealLine delay={0}>Welcome to ProcessCoach.ai</RevealLine>
          </h1>
          <h2 className="font-medium text-muted-foreground">
            <RevealLine delay={140}>
              Your AI-powered workflow automation platform
            </RevealLine>
          </h2>
        </div>

        {/* blocks */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* top 3 cards */}
          <div className="grid auto-rows-min gap-5 md:grid-cols-3 items-stretch">
            {/* plays */}
            <Card
              className="card-pop flex h-full flex-col justify-between rounded-xl"
              style={{ animationDelay: "220ms" }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      <RevealLine delay={260}>Plays</RevealLine>
                    </CardTitle>
                    <CardDescription>
                      <RevealLine delay={320}>
                        Manage and monitor your business plays
                      </RevealLine>
                    </CardDescription>
                  </div>
                  <RevealLine delay={360}>
                    <CirclePlay className="h-5 w-5 text-muted-foreground" />
                  </RevealLine>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <RevealLine delay={420}>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/plays">Manage Plays</Link>
                  </Button>
                </RevealLine>
              </CardContent>
            </Card>

            {/* job descriptions */}
            <Card
              className="card-pop flex h-full flex-col justify-between rounded-xl"
              style={{ animationDelay: "320ms" }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      <RevealLine delay={360}>Job Descriptions</RevealLine>
                    </CardTitle>
                    <CardDescription>
                      <RevealLine delay={420}>
                        Manage your job descriptions and assignment strategies
                      </RevealLine>
                    </CardDescription>
                  </div>
                  <RevealLine delay={460}>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </RevealLine>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <RevealLine delay={520}>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/roles">Manage Job Descriptions</Link>
                  </Button>
                </RevealLine>
              </CardContent>
            </Card>

            {/* settings */}
            <Card
              className="card-pop flex h-full flex-col justify-between rounded-xl"
              style={{ animationDelay: "420ms" }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      <RevealLine delay={460}>Settings</RevealLine>
                    </CardTitle>
                    <CardDescription>
                      <RevealLine delay={520}>
                        Customize your experience and preferences
                      </RevealLine>
                    </CardDescription>
                  </div>
                  <RevealLine delay={560}>
                    <Settings2 className="h-5 w-5 text-muted-foreground" />
                  </RevealLine>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <RevealLine delay={620}>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings">Open Settings</Link>
                  </Button>
                </RevealLine>
              </CardContent>
            </Card>
          </div>

          {/* bottom card (mock) */}
          <Card
            className="card-pop flex flex-1 flex-col rounded-xl md:min-h-[260px]"
            style={{ animationDelay: "520ms" }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <RevealLine delay={560}>Process Metrics</RevealLine>
              </CardTitle>
              <CardDescription>
                <RevealLine delay={620}>
                  Monitor and track your business process performance
                </RevealLine>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
              <RevealLine delay={680}>
                <BarChart2 className="mb-3 h-8 w-8" />
              </RevealLine>
              <div className="font-medium text-foreground">
                <RevealLine delay={740}>Performance Metrics</RevealLine>
              </div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                <RevealLine delay={800}>
                  Process performance analytics will be available here once
                  you configure your first workflow.
                </RevealLine>
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
