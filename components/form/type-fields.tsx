"use client"

import { CheckField, TextAreaField, TextField } from "@/components/ui/field"
import { taskTypeById } from "@/lib/tasks/catalog"
import type { TaskTypeId } from "@/lib/tasks/types"

type Props = {
  taskType: TaskTypeId
  values: Record<string, string | boolean>
  onChange: (key: string, value: string | boolean) => void
  errors?: Record<string, string>
}

export function TypeFields({ taskType, values, onChange, errors = {} }: Props) {
  const config = taskTypeById(taskType)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {config.fields.map((field) => {
        const wide = field.kind === "checkbox" || field.kind === "textarea"
        const wrap = wide ? "lg:col-span-2" : ""
        if (field.kind === "checkbox") {
          return (
            <div key={field.key} className={wrap}>
              <CheckField
                label={field.label}
                help={field.help}
                required={field.required}
                error={errors[field.key]}
                checked={values[field.key] === true}
                onChange={(value) => onChange(field.key, value)}
              />
            </div>
          )
        }
        if (field.kind === "textarea") {
          return (
            <div key={field.key} className={wrap}>
              <TextAreaField
                label={field.label}
                help={field.help}
                required={field.required}
                error={errors[field.key]}
                value={String(values[field.key] ?? "")}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            </div>
          )
        }
        return (
          <div key={field.key} className={wrap}>
            <TextField
              label={field.label}
              help={field.help}
              required={field.required}
              error={errors[field.key]}
              type={field.kind === "text" ? "text" : field.kind}
              inputMode={field.inputMode}
              placeholder={field.placeholder}
              value={String(values[field.key] ?? "")}
              onChange={(event) => onChange(field.key, event.target.value)}
            />
          </div>
        )
      })}
    </div>
  )
}
