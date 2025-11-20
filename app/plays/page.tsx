"use client";

import React, {
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
} from "react";

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
import { Plus, ChevronRight, Layers, Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

import type { Play } from "@/lib/plays-graphql";
import {
  getPlays,
  createPlay,
  createPlayStep,
} from "@/lib/plays-graphql";

import type { Role } from "@/lib/roles-graphql";
import { getRoles } from "@/lib/roles-graphql";

import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { toast } from "sonner";

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

type CreateMode = "manual" | "ai";

type GeneratedStep = {
  step_name: string;
  step_description?: string | null;
  step_num: number;
  step_role_name?: string | null;
};

export default function Page() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // which tab is active when creating a play
  const [createMode, setCreateMode] = useState<CreateMode>("manual");
  // Natural language description to send to the LLM
  const [aiGoal, setAiGoal] = useState("");
  const [playName, setPlayName] = useState("");

  // for smooth height animation in the create play dialog body
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    Promise.resolve().then(() => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      setBodyHeight(rect.height);
    });
  }, [createMode, playName, aiGoal, isFormOpen]);

  // load plays + roles on mount
  useEffect(() => {
    (async () => {
      try {
        const [playsData, rolesData] = await Promise.all([
          getPlays(),
          getRoles(),
        ]);

        setPlays(playsData);
        setRoles(rolesData);
      } catch (err) {
        console.error("Failed to load plays or roles", err);
        toast.error("Failed to load plays or roles.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setPlayName("");
    setCreateMode("manual");
    setAiGoal("");
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!playName.trim()) {
      toast.error("Give this play a name before saving.");
      return;
    }

    setSaving(true);
    try {
      // MANUAL MODE
      if (createMode === "manual") {
        const created = await createPlay({
          play_name: playName.trim(),
        });

        setPlays((prev) => [...prev, created]);
        toast.success("Play created.");
      } else {
        // AI MODE
        const created = await createPlay({
          play_name: playName.trim(),
        });

        setPlays((prev) => [...prev, created]);

        // Fetch python endpoint
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_GENERATE_URL}/generate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                play_id: created.play_id,
                goal: aiGoal,
                roles: roles.map((r) => r.role_name),
              }),
            },
          );

          if (!res.ok) {
            console.error("AI generate endpoint failed", await res.text());
            toast.error("Play created, but we couldn't auto-generate steps.");
          } else {
            const data: { steps: GeneratedStep[] } = await res.json();

            if (Array.isArray(data.steps) && data.steps.length > 0) {
              await Promise.all(
                data.steps.map((step) =>
                  createPlayStep({
                    play_id: created.play_id,
                    step_name: step.step_name,
                    step_description: step.step_description ?? null,
                    step_num: step.step_num,
                    step_role_name: step.step_role_name ?? null,
                  }),
                ),
              );
              toast.success("Play created and steps generated.");
            } else {
              toast.success("Play created.");
            }
          }
        } catch (err) {
          console.error("Failed to trigger AI step generation", err);
          toast.error(
            "Play created, but we couldn't auto-generate steps.",
          );
        }
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to save play", err);
      toast.error("Failed to save play. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* header + breadcrumb */}
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
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              New Play
            </Button>
          </RevealLine>
        </div>

        {/* main content */}
        <main className="px-4 pb-8">
          {loading ? null : plays.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No plays yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first play to get started.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    size="sm"
                    onClick={openCreate}
                    className="bg-sidebar"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Play
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
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
                        const baseDelay = 340 + index * 40;
                        return (
                          <TableRow
                            key={play.play_id}
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
                            <TableCell className="px-0 py-2.5 font-medium">
                              <RevealLine delay={baseDelay}>
                                <span className="relative group inline-block">
                                  {play.play_name}
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

                            <TableCell className="px-0 py-2.5 text-right">
                              <RevealLine delay={baseDelay + 60}>
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/plays/${play.play_id}`}
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
          )}
        </main>

        {/* Create play dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Play</DialogTitle>
            </DialogHeader>
            <div
              ref={containerRef}
              className="mt-2 overflow-hidden"
              style={{
                height: bodyHeight !== undefined ? bodyHeight : "auto",
                transition: "height 220ms ease",
              }}
            >
              <div ref={contentRef}>
                <Tabs
                  value={createMode}
                  onValueChange={(val) =>
                    setCreateMode(val as CreateMode)
                  }
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="ai">Use AI</TabsTrigger>
                  </TabsList>

                  {/* Manual tab */}
                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        required
                        value={playName}
                        onChange={(e) => setPlayName(e.target.value)}
                        placeholder="Play name"
                      />
                    </div>
                  </TabsContent>

                  {/* AI tab */}
                  <TabsContent value="ai" className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        required
                        value={playName}
                        onChange={(e) => setPlayName(e.target.value)}
                        placeholder="Play name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Standard Operating Procedure
                      </label>
                      <Textarea
                        rows={5}
                        value={aiGoal}
                        onChange={(e) => setAiGoal(e.target.value)}
                        placeholder="Describe the process you want this play to capture. For example: how your team handles new customer onboarding, or how to run a weekly pipeline review..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                type="button"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} type="button">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
