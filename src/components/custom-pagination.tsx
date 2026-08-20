import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    baseUrl?: string;
    searchParams?: Record<string, string | number | undefined>;
}

export const CustomPagination = ({
    currentPage,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    baseUrl = "",
    searchParams = {},
}: CustomPaginationProps) => {
    const getPageUrl = (pageNum: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, val]) => {
            if (val !== undefined && val !== "" && key !== "page") {
                params.set(key, String(val));
            }
        });
        params.set("page", String(pageNum));
        const qs = params.toString();
        return qs ? `${baseUrl}?${qs}` : `${baseUrl}?page=${pageNum}`;
    };

    return (
        <Pagination>
            <PaginationContent className="flex flex-wrap gap-2 justify-center">
                {hasPreviousPage && (
                    <PaginationItem>
                        <PaginationPrevious href={getPageUrl(currentPage - 1)} />
                    </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                        return (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    href={getPageUrl(pageNum)}
                                    isActive={pageNum === currentPage}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                    ) {
                        return (
                            <PaginationItem key={pageNum}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }
                    return null;
                })}

                {hasNextPage && (
                    <PaginationItem>
                        <PaginationNext href={getPageUrl(currentPage + 1)} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    );
};