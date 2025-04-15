import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({
  transactions,
  updateTransactionApproval,
  approvalOverrides,
}) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>(
        "setTransactionApproval",
        {
          transactionId,
          value: newValue,
        }
      )
      // updated  hook states and override
      updateTransactionApproval(transactionId, newValue)
    },
    [fetchWithoutCache, updateTransactionApproval]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => {
       
        const effectiveTransaction = {
          ...transaction,
          approved:
            approvalOverrides[transaction.id] !== undefined
              ? approvalOverrides[transaction.id]
              : transaction.approved,
        }
        return (
          <TransactionPane
            key={transaction.id}
            transaction={effectiveTransaction}
            loading={loading}
            setTransactionApproval={setTransactionApproval}
          />
        )
      })}
    </div>
  )
}
