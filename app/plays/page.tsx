"use client";

import React, { useEffect, useState } from "react";

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
import { Plus, ChevronRight, Layers } from "lucide-react";

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

import type { Play } from "@/lib/plays-graphql";
import {
  getPlays,
  createPlay,
  updatePlay,
  deletePlay,
} from "@/lib/plays-graphql";

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

export default function Page() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formState, setFormState] = useState<PlayFormState>({
    play_name: "",
  });

  const [playToDelete, setPlayToDelete] = useState<Play | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // load plays on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getPlays();
        setPlays(data);
      } catch (err) {
        console.error("Failed to load plays", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setFormState({ play_name: "" });
    setIsFormOpen(true);
  };

  const openEdit = (play: Play) => {
    setFormState({
      play_id: play.play_id,
      play_name: play.play_name,
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formState.play_name.trim()) return;

    setSaving(true);
    try {
      if (formState.play_id) {
        const updated = await updatePlay({
          play_id: formState.play_id,
          play_name: formState.play_name.trim(),
        });

        setPlays((prev) =>
          prev.map((p) => (p.play_id === updated.play_id ? updated : p)),
        );
      } else {
        const created = await createPlay({
          play_name: formState.play_name.trim(),
        });

        setPlays((prev) => [...prev, created]);
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error("Failed to save play", err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (play: Play) => {
    setPlayToDelete(play);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!playToDelete) return;

    setDeleting(true);
    try {
      await deletePlay(playToDelete.play_id);
      setPlays((prev) =>
        prev.filter((p) => p.play_id !== playToDelete.play_id),
      );
      setIsDeleteOpen(false);
      setPlayToDelete(null);
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

        {/* Create / Edit dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {formState.play_id ? "Edit Play" : "New Play"}
              </DialogTitle>
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
                onClick={() => setIsFormOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} type="button">
                {formState.play_id ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* delete confirm dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this play?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove
                the play &quot;{playToDelete?.play_name}&quot; from your
                database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteOpen(false);
                  setPlayToDelete(null);
                }}
              >
                Cancel
              </AlertDialogCancel>
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
