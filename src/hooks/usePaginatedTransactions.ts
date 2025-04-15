import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<Transaction[]> | null>(null)

  // resets the transactions and loads the initial page (page 0)
  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: 0,
      }
    )
    // replacing existing data with the new first page.
    setPaginatedTransactions(response)
  }, [fetchWithCache])

  // load the next page of transactions and append them to the current list
  const fetchNextPage = useCallback(async () => {
    // If is no data yet, page 0
    const nextPage = paginatedTransactions ? paginatedTransactions.nextPage : 0

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      { page: nextPage }
    )

    //  new transactions with existing ones
    setPaginatedTransactions((prevResponse) => {
      if (prevResponse === null || response === null) {
        return response
      }
      return {
        data: [...prevResponse.data, ...response.data],
        nextPage: response.nextPage,
      }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  const updateTransactionApproval = useCallback((transactionId: string, newValue: boolean) => {
    setPaginatedTransactions((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        data: prev.data.map((tx) =>
          tx.id === transactionId ? { ...tx, approved: newValue } : tx
        ),
      }
    })
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, fetchNextPage, invalidateData, updateTransactionApproval }
}
