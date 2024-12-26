'use client'

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BreadCrumbDashboard() {
    const pathname = usePathname()

    // Remove empty strings and create breadcrumb segments
    const pathSegments = pathname.split('/').filter(segment => segment)

    // Build up the paths for each breadcrumb level
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/')
        // Capitalize first letter and replace hyphens/underscores with spaces
        const label = segment
            .charAt(0).toUpperCase() +
            segment.slice(1)
                .replace(/[-_]/g, ' ')

        return { path, label }
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map(({ path, label }, index) => (
                    <BreadcrumbItem key={path}>
                        {index !== 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                        {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                            <Link href={path} className="hover:text-primary">
                                {label}
                            </Link>
                        )}
                    </BreadcrumbItem>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}