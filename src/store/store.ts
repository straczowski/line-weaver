import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { createSelectors } from "./create-selectors"
import { DEFAULT_GCODE_SETTINGS, DEFAULT_SETTINGS } from "./default-settings"
import type { AppStore, ProcessingStatus } from "./types"

export const useStore = createSelectors(createStore())

function createStore() {
  const initialState = {
    uploadedImage: null,
    imageData: null,
    settings: DEFAULT_SETTINGS,
    gcodeSettings: DEFAULT_GCODE_SETTINGS,
    processingStatus: "idle" as ProcessingStatus,
    processingError: null,
    svgOutput: null,
    polylines: null,
  }

  return create<AppStore>()(
    devtools(
      (set) => ({
        ...initialState,

        setUploadedImage: (image) => set({ uploadedImage: image }, undefined, "setUploadedImage"),

        setImageData: (data) => set({ imageData: data }, undefined, "setImageData"),

        updateSettings: (partial) =>
          set(
            (state) => ({
              settings: { ...state.settings, ...partial },
            }),
            undefined,
            "updateSettings"
          ),

        resetSettings: () => set({ settings: DEFAULT_SETTINGS }, undefined, "resetSettings"),

        updateGcodeCommands: (partial) =>
          set(
            (state) => ({
              gcodeSettings: {
                ...state.gcodeSettings,
                commands: { ...state.gcodeSettings.commands, ...partial },
              },
            }),
            undefined,
            "updateGcodeCommands"
          ),

        updateGcodeSheet: (partial) =>
          set(
            (state) => ({
              gcodeSettings: {
                ...state.gcodeSettings,
                sheet: { ...state.gcodeSettings.sheet, ...partial },
              },
            }),
            undefined,
            "updateGcodeSheet"
          ),

        resetGcodeSettings: () =>
          set({ gcodeSettings: DEFAULT_GCODE_SETTINGS }, undefined, "resetGcodeSettings"),

        setProcessingStatus: (status) =>
          set({ processingStatus: status }, undefined, "setProcessingStatus"),

        setProcessingError: (error) =>
          set({ processingError: error }, undefined, "setProcessingError"),

        setSvgOutput: (svg) => set({ svgOutput: svg }, undefined, "setSvgOutput"),

        setPolylines: (polylines) => set({ polylines }, undefined, "setPolylines"),

        reset: () => set(initialState, undefined, "reset"),
      }),
      { name: "LineWeaverStore" }
    )
  )
}
