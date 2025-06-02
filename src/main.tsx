import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import CustomToaster from './toast-config/CustomToaster.tsx'
import appStore from './store/appStore.ts'

const queryClient = new QueryClient();


createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={appStore}>
      {/* <Toaster position="top-right" /> */}
      <CustomToaster />
      <App />
    </Provider>
  </QueryClientProvider>
)
