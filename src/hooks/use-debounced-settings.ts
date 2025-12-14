import { useSettings } from "../store/selectors"
import { useDebounce } from "./use-debounce"

export const useDebouncedSettings = (delay = 250) => {
  const settings = useSettings()
  return useDebounce(settings, delay)
}
