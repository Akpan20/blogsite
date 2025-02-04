import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface AlertProps {
  variant?: "default" | "success" | "error"
  title?: string
  description?: string
  className?: string
}

const Alert = ({
  variant = "default",
  title,
  description,
  className,
}: AlertProps) => {
  return (
    <div
      className={cn(
        "relative w-full rounded-lg border p-4",
        {
          "border-gray-200 bg-gray-50 text-gray-900": variant === "default",
          "border-green-200 bg-green-50 text-green-900": variant === "success",
          "border-red-200 bg-red-50 text-red-900": variant === "error",
        },
        className
      )}
    >
      <div className="flex items-start space-x-3">
        {variant === "default" && (
          <AlertCircle className="h-5 w-5 text-gray-600" />
        )}
        {variant === "success" && (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        )}
        {variant === "error" && (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <div>
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Alert