import { useShallow } from "zustand/react/shallow"
import { useStore } from "./store"

export const useImageActions = () =>
  useStore(
    useShallow((state) => ({
      setUploadedImage: state.setUploadedImage,
      setImageData: state.setImageData,
    }))
  )

export const useSettingsActions = () =>
  useStore(
    useShallow((state) => ({
      updateSettings: state.updateSettings,
      resetSettings: state.resetSettings,
    }))
  )

export const useGcodeSettingsActions = () =>
  useStore(
    useShallow((state) => ({
      updateGcodeCommands: state.updateGcodeCommands,
      updateGcodeSheet: state.updateGcodeSheet,
      resetGcodeSettings: state.resetGcodeSettings,
    }))
  )

export const useProcessingActions = () =>
  useStore(
    useShallow((state) => ({
      setProcessingStatus: state.setProcessingStatus,
      setProcessingProgress: state.setProcessingProgress,
      setProcessingError: state.setProcessingError,
    }))
  )

export const useOutputActions = () =>
  useStore(
    useShallow((state) => ({
      setSvgOutput: state.setSvgOutput,
      setPolylines: state.setPolylines,
    }))
  )

export const useResetAction = () => useStore(useShallow((state) => ({ reset: state.reset })))
