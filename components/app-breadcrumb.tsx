"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = { label: string; href?: string };

const breadcrumbConfig: Record<string, Crumb[]> = {
  "/": [{ label: "Dashboard", href: "/" }],
  "/dashboard": [{ label: "Dashboard", href: "/dashboard" }],
  "/plays": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Plays", href: "/plays" },
  ],
  "/roles": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Job Descriptions", href: "/roles" },
  ],
  "/settings": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
  ],
};

type AppBreadcrumbProps = {
  extraCrumbs?: Crumb[];
};

export function AppBreadcrumb({ extraCrumbs }: AppBreadcrumbProps) {
  const pathname = usePathname();

  let baseCrumbs: Crumb[] | undefined = breadcrumbConfig[pathname];

  // Any nested plays route uses /plays as the base
  if (!baseCrumbs && pathname.startsWith("/plays/")) {
    baseCrumbs = breadcrumbConfig["/plays"];
  }

  // Fallback
  if (!baseCrumbs) {
    baseCrumbs = [{ label: "Dashboard", href: "/dashboard" }];
  }

  const crumbs = extraCrumbs ? [...baseCrumbs, ...extraCrumbs] : baseCrumbs;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <span key={crumb.label} className="flex items-center">
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
