"use client";

import React, { useEffect, useState } from "react";

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

import { Plus, Pencil, Trash2, Layers } from "lucide-react";

import type { Role } from "@/lib/roles-graphql";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "@/lib/roles-graphql";

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

type RoleFormState = {
  isEditing: boolean;
  roleName: string;
  roleDescription: string;
};

export default function Page() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [formState, setFormState] = useState<RoleFormState>({
    isEditing: false,
    roleName: "",
    roleDescription: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // load roles on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error("Failed to load roles", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setFormState({
      isEditing: false,
      roleName: "",
      roleDescription: "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setFormState({
      isEditing: true,
      roleName: role.role_name,
      roleDescription: role.role_description ?? "",
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const name = formState.roleName.trim();
    const desc = formState.roleDescription.trim();

    // required validation
    if (!name && !desc) {
      setFormError("Name and description are required.");
      return;
    }
    if (!name) {
      setFormError("Name is required.");
      return;
    }
    if (!desc) {
      setFormError("Description is required.");
      return;
    }

    // duplicate-name check on the client for create
    if (!formState.isEditing) {
      const exists = roles.some(
        (r) => r.role_name.toLowerCase() === name.toLowerCase(),
      );
      if (exists) {
        setFormError("A job description with this name already exists.");
        return;
      }
    }

    setSaving(true);
    setFormError(null);

    try {
      if (formState.isEditing) {
        // Update existing role (role_name is the identifier now)
        const updated = await updateRole({
          role_name: name,
          role_description: desc,
        });

        setRoles((prev) =>
          prev.map((r) =>
            r.role_name === updated.role_name ? updated : r,
          ),
        );
      } else {
        // Create new role
        const created = await createRole({
          role_name: name,
          role_description: desc,
        });

        setRoles((prev) => [...prev, created]);
      }

      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Failed to save role", err);

      const message =
        typeof err?.message === "string" ? err.message.toLowerCase() : "";

      if (message.includes("duplicate") || message.includes("unique")) {
        setFormError("A job description with this name already exists.");
      } else {
        setFormError("Something went wrong while saving. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    setDeleting(true);
    try {
      await deleteRole(roleToDelete.role_name);
      setRoles((prev) =>
        prev.filter((r) => r.role_name !== roleToDelete.role_name),
      );
      setIsDeleteOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      console.error("Failed to delete role", err);
    } finally {
      setDeleting(false);
    }
  };

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
              size="sm"
              className="bg-sidebar text-white py-5"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              Add Job Description
            </Button>
          </RevealLine>
        </div>

        {/* cards grid */}
        <main className="px-4 pb-8">
          {loading ? null : roles.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No job descriptions yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first job description to get started.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    size="sm"
                    onClick={openCreate}
                    className="bg-sidebar"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job Description
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roles.map((role, index) => {
                const baseDelay = 150 + index * 90;
                return (
                  <div
                    key={role.role_name}
                    className="card-pop"
                    style={{ animationDelay: `${baseDelay}ms` }}
                  >
                    <Card className="flex h-full flex-col justify-between shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex flex-col gap-1">
                          <RevealLine delay={baseDelay + 60}>
                            <span className="text-sm font-semibold">
                              {role.role_name}
                            </span>
                          </RevealLine>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="flex flex-1 flex-col justify-between gap-4">
                        <RevealLine delay={baseDelay + 140}>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {role.role_description || "No description"}
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
                                onClick={() => openEdit(role)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </RevealLine>
                            <RevealLine delay={baseDelay + 280}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => confirmDelete(role)}
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
          )}
        </main>

        {/* Create / Edit dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {formState.isEditing
                  ? "Edit Job Description"
                  : "Add Job Description"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formState.roleName}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      roleName: e.target.value,
                    }))
                  }
                  placeholder="Job description name"
                  disabled={formState.isEditing}
                />
                {formState.isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Name can&rsquo;t be changed after creation.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  required
                  value={formState.roleDescription}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      roleDescription: e.target.value,
                    }))
                  }
                  placeholder="Describe this job..."
                  rows={4}
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
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
                {formState.isEditing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this job description?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the
                job description &quot;{roleToDelete?.role_name}&quot; from your
                database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsDeleteOpen(false);
                  setRoleToDelete(null);
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
