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

// Map URL paths to breadcrumb trails (more dynamic than setting them up per page)
const breadcrumbConfig: Record<
  string,
  { label: string; href?: string }[]
> = {
  "/": [{ label: "Dashboard", href: "/" }],
  "/dashboard": [{ label: "Dashboard", href: "/dashboard" }],
  "/plays": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Plays" },
  ],
  "/roles": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Job Descriptions" },
  ],
  "/settings": [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings" },
  ],
};

export function AppBreadcrumb() {
  const pathname = usePathname();
  const crumbs = breadcrumbConfig[pathname] ?? [
    { label: "Dashboard", href: "/dashboard" },
  ];

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
