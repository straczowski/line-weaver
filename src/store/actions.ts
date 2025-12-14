import { useShallow } from "zustand/react/shallow"
import { useAppStore } from "./app-store"

export const useImageActions = () =>
  useAppStore(
    useShallow((state) => ({
      setUploadedImage: state.setUploadedImage,
      setImageData: state.setImageData,
    }))
  )

export const useSettingsActions = () =>
  useAppStore(
    useShallow((state) => ({
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
    }))
  )

export const useGcodeSettingsActions = () =>
  useAppStore(
    useShallow((state) => ({
      updateGcodeCommands: state.updateGcodeCommands,
      updateGcodeSheet: state.updateGcodeSheet,
      resetGcodeSettings: state.resetGcodeSettings,
    }))
  )

export const useProcessingActions = () =>
  useAppStore(
    useShallow((state) => ({
      setProcessingStatus: state.setProcessingStatus,
      setProcessingProgress: state.setProcessingProgress,
      setProcessingError: state.setProcessingError,
    }))
  )

export const useOutputActions = () =>
  useAppStore(
    useShallow((state) => ({
      setSvgOutput: state.setSvgOutput,
      setPolylines: state.setPolylines,
    }))
  )

export const useResetAction = () => useAppStore(useShallow((state) => ({ reset: state.reset })))
