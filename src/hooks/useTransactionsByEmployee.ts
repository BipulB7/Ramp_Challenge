import { useCallback, useState } from "react"
import { Transaction } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee() {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(async (employeeId: string) => {
    const response = await fetchWithCache<Transaction[], { employeeId: string }>(
      "transactionsByEmployee",
      { employeeId }
    )
    setTransactions(response)
  }, [fetchWithCache])

  const invalidateData = useCallback(() => {
    setTransactions(null)
  }, [])

  const updateTransactionApproval = useCallback((transactionId: string, newValue: boolean) => {
    setTransactions((prev) => {
      if (!prev) return prev
      return prev.map((tx) =>
        tx.id === transactionId ? { ...tx, approved: newValue } : tx
      )
    })
  }, [])

  return { data: transactions, loading, fetchById, invalidateData, updateTransactionApproval }
}
