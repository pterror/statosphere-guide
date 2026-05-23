import DefaultTheme from 'vitepress/theme'
import { StatosphereStudio } from '@pterror/statosphere-studio'
import '@pterror/statosphere-studio/dist/style.css'
import { createPinia } from 'pinia'
import type { App } from 'vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.use(createPinia())
    app.component('StatosphereStudio', StatosphereStudio)
  },
}
