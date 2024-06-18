import { createTheme, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const rootNode = document.getElementById('root')
const root = createRoot(rootNode as HTMLElement)

const theme = createTheme({
  /** Put your mantine theme override here */
})

root.render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>,
)
