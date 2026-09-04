import { PagedResult } from "@/types";
import { WalletTransaction } from "./type";

export const EMPTY_RESULT: PagedResult<WalletTransaction> = {
    endPage: 0,
    items: [],
    maxNavigationPages: 5,
    pageNumber: 0,
    pageNumbers: [],
    pageSize: 0,
    startPage: 0,
    totalItems: 0,
    totalPages: 0,
};
