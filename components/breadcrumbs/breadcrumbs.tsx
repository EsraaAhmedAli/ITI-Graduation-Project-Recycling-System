"use client";

import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const name = decodeURIComponent(segment)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return { name, href, isLast: index === segments.length - 1 };
  });

  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-4">
      <BreadcrumbItem href="/">
        <Home className="mr-2 h-4 w-4" />
        Home
      </BreadcrumbItem>

      {crumbs.map((crumb) => (
        <BreadcrumbItem key={crumb.href}>
          {crumb.isLast ? (
            <span className="text-green-600">{crumb.name}</span>
          ) : (
            <Link href={crumb.href} className="hover:underline">
              {crumb.name}
            </Link>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
