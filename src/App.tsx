import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const {
    data: paginatedTransactions,
    updateTransactionApproval: updatePaginatedTransactionApproval,
    ...paginatedTransactionsUtils
  } = usePaginatedTransactions()
  const {
    data: transactionsByEmployee,
    updateTransactionApproval: updateEmployeeTransactionApproval,
    ...transactionsByEmployeeUtils
  } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)

  // tores toggled approval values keyed by transactionId
  const [approvalOverrides, setApprovalOverrides] = useState<Record<string, boolean>>({})

  //  transactions from paginated or employee-specific data
  const transactions = useMemo(() => {
    return paginatedTransactions?.data ?? transactionsByEmployee ?? null
  }, [paginatedTransactions, transactionsByEmployee])

  // updated both hook states and the approval override
  const aggregatedUpdateTransactionApproval = useCallback(
    (transactionId: string, newValue: boolean) => {
      updateEmployeeTransactionApproval(transactionId, newValue)
      updatePaginatedTransactionApproval(transactionId, newValue)
      setApprovalOverrides((prev) => ({ ...prev, [transactionId]: newValue }))
    },
    [updateEmployeeTransactionApproval, updatePaginatedTransactionApproval]
  )

  // 1st load of transactions or full resett
  const loadInitialTransactions = useCallback(async () => {
    setIsLoading(true)
    // when loading initial data clear employee-specific data.
    transactionsByEmployeeUtils.invalidateData()

    // fetch employee data if needed
    if (!employees) {
      await employeeUtils.fetchAll()
    }

    //  first page of paginated transactions 
    await paginatedTransactionsUtils.fetchAll()
    setIsLoading(false)
  }, [employees, employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  // transactions by employee filter
  const loadTransactionsByEmployee = useCallback(async (employeeId: string) => {
    // clearing paginated transactions
    paginatedTransactionsUtils.invalidateData()

    // transactions for the selected employee.
    await transactionsByEmployeeUtils.fetchById(employeeId)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])

  // function to load more transactions (for pagination)
  const loadMoreTransactions = useCallback(async () => {
    setIsLoading(true)
    await paginatedTransactionsUtils.fetchNextPage()
    setIsLoading(false)
  }, [paginatedTransactionsUtils])

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadInitialTransactions()
    }
  }, [employeeUtils.loading, employees, loadInitialTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
         
          // fetch only paginated transactions (employees are already loaded)
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if (newValue.id === "all") {
            
              transactionsByEmployeeUtils.invalidateData()

              if (!paginatedTransactions) {
                setIsLoading(true)
                await paginatedTransactionsUtils.fetchAll()
                setIsLoading(false)
              }
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions
            transactions={transactions}
            updateTransactionApproval={aggregatedUpdateTransactionApproval}
            approvalOverrides={approvalOverrides}
          />

          {paginatedTransactions &&
            paginatedTransactions.nextPage != null &&
            !transactionsByEmployee && (
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading}
                onClick={async () => {
                  await loadMoreTransactions()
                }}
              >
                View More
              </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
