"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
import { Textarea } from "@/components/ui/textarea";

import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { GripVertical, Layers, Trash2 } from "lucide-react";

import type { Play, PlayStep } from "@/lib/plays-graphql";
import {
  getPlay,
  getPlaySteps,
  saveStepNames,
  deletePlayStep,
} from "@/lib/plays-graphql";

import type { Role } from "@/lib/roles-graphql";
import { getRoles } from "@/lib/roles-graphql";

import { toast } from "sonner";

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const NO_ROLE_VALUE = "__no_role__";

// Reveal anim
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

// Sortable step card 
type SortableStepCardProps = {
  step: PlayStep;
  index: number;
  configuredStepId: string | null;
  onConfigure: (id: string | null) => void;
  onDelete: (id: string) => void;
  onFieldChange: (
    stepId: string,
    field: "step_name" | "step_description",
    value: string,
  ) => void;
};

function SortableStepCard({
  step,
  configuredStepId,
  onConfigure,
  onDelete,
  onFieldChange,
}: SortableStepCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? "grabbing" : "default",
  };

  const isConfigured = configuredStepId === step.id;

  return (
    // DnD wrapper directly around the card — no reveal wrapper here
    <div ref={setNodeRef} style={style} className="w-full">
      <div
        className={`rounded-xl border bg-card/70 px-4 py-3 shadow-sm transition-colors ${
          isConfigured ? "border-primary/70" : "border-border/60"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border bg-muted text-muted-foreground cursor-grab"
            aria-label="Reorder step"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          <Input
            value={step.step_name || ""}
            onChange={(e) =>
              onFieldChange(step.id, "step_name", e.target.value)
            }
            placeholder="Step name"
            className="flex-1"
          />

          <span className="inline-flex items-center rounded-md border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Step {step.step_num}
          </span>

          <Button
            size="sm"
            type="button"
            variant={isConfigured ? "default" : "outline"}
            onClick={() => onConfigure(isConfigured ? null : step.id)}
          >
            Configure
          </Button>

          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => onDelete(step.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Description
          </label>
          <Textarea
            rows={3}
            value={step.step_description || ""}
            onChange={(e) =>
              onFieldChange(step.id, "step_description", e.target.value)
            }
            placeholder="Describe what should happen in this step..."
          />
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const params = useParams<{ playId: string }>();
  const playId = params.playId;

  const [play, setPlay] = useState<Play | null>(null);
  const [steps, setSteps] = useState<PlayStep[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // which step is currently being configured (right-hand card)
  const [configuredStepId, setConfiguredStepId] = useState<string | null>(null);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // drag threshold so clicks still work
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSteps((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(prev, oldIndex, newIndex);

      // re-number step_num so it matches new order
      const updated = reordered.map((s, idx) => ({
        ...s,
        step_num: idx + 1,
      }));

      return updated;
    });
  };

  // load play, steps, and roles
  useEffect(() => {
    if (!playId) return;

    (async () => {
      try {
        const [playData, stepsData, rolesData] = await Promise.all([
          getPlay(playId),
          getPlaySteps(playId),
          getRoles(),
        ]);

        setPlay(playData);
        setSteps(stepsData);
        setRoles(rolesData);
      } catch (err) {
        console.error("Failed to load play, steps, or roles", err);
        toast.error("Failed to load this play.");
      } finally {
        setLoading(false);
      }
    })();
  }, [playId]);

  //Step editing helpers (local state)

  const handleStepFieldChange = (
    stepId: string,
    field: "step_name" | "step_description",
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              [field]: value,
            }
          : s,
      ),
    );
  };

  const handleStepRoleChange = (stepId: string, roleName: string | null) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? {
              ...s,
              step_role_name: roleName,
            }
          : s,
      ),
    );
  };

  const handleDeleteStep = async (stepId: string) => {
    // If it's a new unsaved step just remove it locally
    if (stepId.startsWith("temp-")) {
      setSteps((prev) => prev.filter((s) => s.id !== stepId));
      if (configuredStepId === stepId) {
        setConfiguredStepId(null);
      }
      return;
    }

    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    if (configuredStepId === stepId) {
      setConfiguredStepId(null);
    }

    try {
      await deletePlayStep(stepId);
      toast.success("Step deleted.");
    } catch (err) {
      console.error("Failed to delete step", err);
      toast.error("Failed to delete step. Please refresh and try again.");
    }
  };

  const handleAddStep = () => {
    if (!playId) return;
    const tempId = `temp-${Date.now()}`;

    setSteps((prev) => [
      ...prev,
      {
        id: tempId as any,
        play_id: playId,
        client_id: play?.client_id ?? null,
        step_num: prev.length + 1,
        step_name: "",
        step_description: "",
        step_role_name: null,
      },
    ]);
  };

  const configuredStep = configuredStepId
    ? steps.find((s) => s.id === configuredStepId) ?? null
    : null;

  // ---- Save all changes (name + description + role + order) ----
  const handleSaveAllChanges = async () => {
    if (!play || !playId) return;

    // validation: every step (existing or new) must have a non-empty name
    const invalid = steps.find((s) => !s.step_name || !s.step_name.trim());
    if (invalid) {
      toast.error("Give every step a name before saving.");
      return;
    }

    setSaving(true);
    try {
      await saveStepNames(steps);

      // re-fetch to replace temp IDs with real ones and sync DB
      const freshSteps = await getPlaySteps(playId);
      setSteps(freshSteps);
      setConfiguredStepId(null);

      toast.success("Play steps saved.");
    } catch (err) {
      console.error("Failed to save steps", err);
      toast.error("Failed to save. Please try again.");
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
            <AppBreadcrumb
              extraCrumbs={
                !loading && play
                  ? [
                      {
                        label: play.play_name,
                        href: `/plays/${play.play_id}`,
                      },
                      { label: "Edit" },
                    ]
                  : !loading && !play
                  ? [{ label: "Play not found" }]
                  : undefined
              }
            />
          </div>
          {/* logo */}
          <div className="pr-4">
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
                  ? `Edit Play: ${play.play_name}`
                  : "Play not found"}
              </RevealLine>
            </h1>
            <h2 className="font-medium text-muted-foreground">
              <RevealLine delay={140}>
                Edit the details of this play
              </RevealLine>
            </h2>
          </div>

          {play && (
            <RevealLine delay={220} className="inline-block">
              <Button
                size="sm"
                type="button"
                onClick={handleSaveAllChanges}
                disabled={saving}
                className="bg-sidebar"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </RevealLine>
          )}
        </div>

        {/* main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Steps editor card */}
            <Card
              className="card-pop flex flex-1 flex-col rounded-xl"
              style={{ animationDelay: "260ms" }}
            >
              <CardHeader className="pb-3 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  <RevealLine delay={300}>Steps</RevealLine>
                </CardTitle>

                {!loading && play && (
                  <RevealLine delay={320} className="inline-block">
                    <Button
                      size="sm"
                      type="button"
                      onClick={handleAddStep}
                      className="flex items-center gap-1 bg-sidebar"
                    >
                      + Add Step
                    </Button>
                  </RevealLine>
                )}
              </CardHeader>

              <CardContent className="pt-0 px-6 pb-6">
                {loading ? null : !play ? (
                  <p className="text-sm text-muted-foreground">
                    We couldnt find this play. It may have been
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
                          type="button"
                          onClick={handleAddStep}
                        >
                          Add Step
                        </Button>
                      </EmptyContent>
                    </Empty>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={steps.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {steps.map((step, index) => (
                          <SortableStepCard
                            key={step.id}
                            step={step}
                            index={index}
                            configuredStepId={configuredStepId}
                            onConfigure={setConfiguredStepId}
                            onDelete={handleDeleteStep}
                            onFieldChange={handleStepFieldChange}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>

            {/* step details card */}
            {configuredStep && (
              <Card className="card-pop flex flex-1 flex-col rounded-xl">
                <CardHeader className="pb-3 px-6">
                  <CardTitle className="text-base">
                    <RevealLine delay={340}>
                      Step Details:{" "}
                      <span className="font-semibold">
                        {configuredStep.step_name || "Untitled step"}
                      </span>
                    </RevealLine>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-6 pb-6 space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Job Description
                    </div>
                    <Select
                      value={
                        configuredStep.step_role_name ?? NO_ROLE_VALUE
                      }
                      onValueChange={(value) =>
                        handleStepRoleChange(
                          configuredStep.id,
                          value === NO_ROLE_VALUE ? null : value,
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role for this step" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_ROLE_VALUE}>
                          <span className="text-muted-foreground">
                            No job description assigned
                          </span>
                        </SelectItem>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.role_name}
                            value={role.role_name}
                          >
                            {role.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
