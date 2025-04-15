import { useState, useEffect } from "react"
import { InputCheckbox } from "../InputCheckbox"
import { TransactionPaneComponent } from "./types"

export const TransactionPane: TransactionPaneComponent = ({
  transaction,
  loading,
  setTransactionApproval: consumerSetTransactionApproval,
}) => {
  // loc state for the approved value
  const [approved, setApproved] = useState(transaction.approved)

  // syncing local state if the parent transaction prop changes
  useEffect(() => {
    setApproved(transaction.approved)
  }, [transaction.approved])

  const handleCheckboxChange = async (newValue: boolean) => {
    console.log("TransactionPane: Checkbox toggled, new value:", newValue)
    setApproved(newValue)
    try {
      await consumerSetTransactionApproval({
        transactionId: transaction.id,
        newValue,
      })
      console.log("TransactionPane: Approval update succeeded")
    } catch (error) {
      console.error("TransactionPane: Approval update failed", error)
      // revert to value if update fails
      setApproved(!newValue)
    }
  }

  return (
    <div className="RampPane">
      <div className="RampPane--content">
        <p className="RampText">{transaction.merchant}</p>
        <b>{moneyFormatter.format(transaction.amount)}</b>
        <p className="RampText--hushed RampText--s">
          {transaction.employee.firstName} {transaction.employee.lastName} - {transaction.date}
        </p>
      </div>
      <InputCheckbox
        id={transaction.id}
        checked={approved}
        disabled={loading}
        onChange={handleCheckboxChange}
      />
    </div>
  )
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})
