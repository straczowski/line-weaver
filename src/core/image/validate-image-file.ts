import { z } from "zod"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validationResultSchema = z.object({
  isValid: z.boolean(),
  error: z.string().optional(),
})

export type ValidationResult = z.infer<typeof validationResultSchema>

const ALLOWED_TYPES = ["image/png", "image/jpeg"]
const MAX_FILE_SIZE = 20 * 1024 * 1024

export const validateImageFile = (file: File): ValidationResult => {
  if (!isValidType(file)) {
    return { isValid: false, error: "Only PNG and JPG images are allowed" }
  }

  if (!isValidSize(file)) {
    return { isValid: false, error: "Image must be smaller than 20MB" }
  }

  return { isValid: true }
}

const isValidType = (file: File): boolean => {
  return ALLOWED_TYPES.includes(file.type)
}

const isValidSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE
}
