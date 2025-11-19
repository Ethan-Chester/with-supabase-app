"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Layers } from "lucide-react";

import type { Play, PlayStep } from "@/lib/plays-graphql";
import {
  getPlay,
  getPlaySteps,
  updatePlay,
  deletePlay,
} from "@/lib/plays-graphql";
import Link from "next/link";


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

type PlayFormState = {
  play_id?: string;
  play_name: string;
};

export default function PlayPage() {
  const router = useRouter();
  const params = useParams<{ playId: string }>();
  const playId = params.playId;

  const [play, setPlay] = useState<Play | null>(null);
  const [steps, setSteps] = useState<PlayStep[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formState, setFormState] = useState<PlayFormState>({
    play_name: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // load this play + its steps on mount / param change
  useEffect(() => {
    if (!playId) return;

    (async () => {
      try {
        const [playData, stepsData] = await Promise.all([
          getPlay(playId),
          getPlaySteps(playId),
        ]);

        setPlay(playData);
        setSteps(stepsData);

        if (playData) {
          setFormState({
            play_id: playData.play_id,
            play_name: playData.play_name,
          });
        }
      } catch (err) {
        console.error("Failed to load play or steps", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [playId]);

  const openEdit = () => {
    if (!play) return;
    setFormState({
      play_id: play.play_id,
      play_name: play.play_name,
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!formState.play_id) return;
    if (!formState.play_name.trim()) return;

    setSaving(true);
    try {
      const updated = await updatePlay({
        play_id: formState.play_id,
        play_name: formState.play_name.trim(),
      });
      setPlay(updated);
      setIsEditOpen(false);
    } catch (err) {
      console.error("Failed to update play", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!play) return;

    setDeleting(true);
    try {
      await deletePlay(play.play_id);
      router.push("/plays");
    } catch (err) {
      console.error("Failed to delete play", err);
    } finally {
      setDeleting(false);
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

            <AppBreadcrumb
              extraCrumbs={
                !loading && play
                  ? [{ label: play.play_name }]
                  : !loading && !play
                  ? [{ label: "Play not found" }]
                  : undefined
              }
            />
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
              <RevealLine delay={0}>
                {loading
                  ? ""
                  : play
                  ? play.play_name
                  : "Play not found"}
              </RevealLine>
            </h1>
            <h2 className="font-medium text-muted-foreground">
              <RevealLine delay={140}>
                View and manage this play
              </RevealLine>
            </h2>
          </div>

          {!loading && play && (
            <RevealLine delay={220} className="inline-block">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/plays/${play.play_id}/edit`}
                    className="flex items-center gap-1"
                  >
                  Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </RevealLine>
          )}
        </div>

        {/* main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card
            className="card-pop flex flex-1 flex-col rounded-xl"
            style={{ animationDelay: "260ms" }}
          >
            <CardHeader className="pb-3 px-6">
              <CardTitle className="text-base">
                <RevealLine delay={300}>Play Steps</RevealLine>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0 px-6">
              {loading ? null : !play ? (
                <p className="text-sm text-muted-foreground">
                  We couldn&apos;t find this play. It may have been
                  deleted.
                </p>
              ) : steps.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Layers className="h-8 w-8 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No steps yet</EmptyTitle>
                      <EmptyDescription>
                        Define the sequence of steps that make up this play.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        size="sm"
                        className="bg-sidebar"
                      >
                        Add Steps
                      </Button>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="px-0 w-16">Step</TableHead>
                      <TableHead className="px-0">Name</TableHead>
                      <TableHead className="px-0">Description</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {steps.map((step, index) => {
                      const baseDelay = 340 + index * 40;
                      return (
                        <TableRow
                          key={step.id}
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
                          <TableCell className="px-0 py-2.5">
                            <RevealLine delay={baseDelay}>
                              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-sidebar text-primary-foreground text-xs font-semibold">
                                {step.step_num}
                              </div>
                            </RevealLine>
                          </TableCell>

                          <TableCell className="px-0 py-2.5 font-medium">
                            <RevealLine delay={baseDelay}>
                              {step.step_name}
                            </RevealLine>
                          </TableCell>

                          <TableCell className="px-0 py-2.5 text-sm text-foreground">
                            <RevealLine delay={baseDelay + 40}>
                              {step.step_description || "No description"}
                            </RevealLine>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Play</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formState.play_name}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      play_name: e.target.value,
                    }))
                  }
                  placeholder="Play name"
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* delete confirm dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this play?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                this play and any associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
