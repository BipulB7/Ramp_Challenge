import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  // stable input id using a ref
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  const handleChange = () => {
    const newValue = !checked
    console.log("InputCheckbox: Toggled value from", checked, "to", newValue)
    onChange(newValue)
  }

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      {/* placing the input first so that its state remains controlled */}
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
      />
      {/* associated the label with the input using htmlFor attribute */}
      <label
        htmlFor={inputId}
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
    </div>
  )
}
