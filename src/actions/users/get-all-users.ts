import { getAllUsersService } from "@/services/user"
import { GetAllUsersParams, PaginatedUsersResponse } from "@/types/user"

export const getAllUserPagination = async ({
    page = 1,
    limit = 10,
    orderBy = 'createdAt',
    order = 'asc'
}: GetAllUsersParams = {}): Promise<PaginatedUsersResponse> => {
    try {
        const users = await getAllUsersService({
            page,
            limit,
            orderBy,
            order
        });

        return users;
    } catch (error) {
        console.error('Error in getAllUserPagination:', error);
        throw new Error('Failed to fetch users. Please try again later.');
    }
}