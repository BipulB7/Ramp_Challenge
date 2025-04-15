import { FunctionComponent } from "react"
import { Transaction } from "src/utils/types"

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

export type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  approved?: boolean
  setTransactionApproval: SetTransactionApprovalFunction
}

export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
