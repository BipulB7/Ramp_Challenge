import Downshift from "downshift"
import { useCallback, useState, useEffect, useRef } from "react"
import classNames from "classnames"
import { DropdownPosition, GetDropdownPositionFn, InputSelectOnChange, InputSelectProps } from "./types"

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  })
  // trackking dropdown open state to update the position on scroll
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return
      }
      // if employee id is empty,  assign a special id "all"
      const parsed = parseItem(selectedItem)
      if (!parsed.value || parsed.value.trim() === "") {
        //  new object from selectedItem with id "all"
        const modifiedItem = { ...selectedItem, id: "all" }
        consumerOnChange(modifiedItem)
        setSelectedValue(modifiedItem)
        //  if "all" employees is selected, show all transactions off bat (might have to click view more)
        if (modifiedItem.id === "all") {
          window.dispatchEvent(new Event("resetPagination"))
        }
      } else {
        consumerOnChange(selectedItem)
        setSelectedValue(selectedItem)
      }
    },
    [consumerOnChange, parseItem]
  )

  //  updating dropdown position on scroll if open
  useEffect(() => {
    const handleScroll = () => {
      if (inputRef.current) {
        setDropdownPosition(getDropdownPosition(inputRef.current))
      }
    }

    if (isDropdownOpen) {
      window.addEventListener("scroll", handleScroll)
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isDropdownOpen])

  return (
    <Downshift<TItem>
      id="RampSelect"
      // keeping track of the dropdown open state
      onStateChange={(changes) => {
        if (typeof changes.isOpen === "boolean") {
          setIsDropdownOpen(changes.isOpen)
        }
      }}
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "All Employees")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps()
        const parsedSelectedItem =
          selectedItem === null ? null : parseItem(selectedItem)

        return (
          <div className="RampInputSelect--root">
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />
            {/*  ref to the input element */}
            <div
              className="RampInputSelect--input"
              ref={inputRef}
              onClick={(event) => {
                //  ref when calculating position
                const targetElement = inputRef.current || event.target
                setDropdownPosition(getDropdownPosition(targetElement))
                toggleProps.onClick(event)
              }}
            >
              {inputValue}
            </div>

            <div
              className={classNames("RampInputSelect--dropdown-container", {
                "RampInputSelect--dropdown-container-opened": isOpen,
              })}
              {...getMenuProps()}
              // make sure the container is  positioned so that we can update top and left
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
            >
              {renderItems()}
            </div>
          </div>
        )

        function renderItems() {
          if (!isOpen) {
            return null
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item)
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected":
                      parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            )
          })
        }
      }}
    </Downshift>
  )
}

const getDropdownPosition: GetDropdownPositionFn = (target) => {
  if (target instanceof Element) {
    const { top, left } = target.getBoundingClientRect()
    const { scrollY } = window
    return {
      top: scrollY + top + 63,
      left,
    }
  }

  return { top: 0, left: 0 }
}
