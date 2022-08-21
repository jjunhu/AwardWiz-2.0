/// <reference types="vitest" />

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import Icons from "unplugin-icons/vite"
import { visualizer } from "rollup-plugin-visualizer"

import watchAndRun from "@kitql/vite-plugin-watch-and-run"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },

  plugins: [
    react(),
    Icons({
      compiler: "jsx",
      jsx: "react",
      defaultStyle: "vertical-align: text-bottom;"
    }),
    // @ts-expect-error (until vite updates to fix the incompatibility, see: https://github.com/btd/rollup-plugin-visualizer/issues/124)
    visualizer({ open: process.env.SHOW_VIZ ? process.env.SHOW_VIZ === "true" : true }),
    watchAndRun([{
      name: "generate-ts-schemas",
      watch: path.resolve("src/**/*.schema.json"),
      run: "npm run schemas"
    }])
  ],

  test: {
    globals: true,
    maxConcurrency: 10,
    testTimeout: 60000, // incase we get in the test queue on browserless
    environment: "jsdom",
    coverage: {
      reporter: ["lcovonly"],
      enabled: true,
      clean: true
    },
    sequence: { shuffle: true }
  }
})
