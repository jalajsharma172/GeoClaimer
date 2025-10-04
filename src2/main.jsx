import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'

// import { UserProvider } from './context/DataContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { EchoProvider } from './context/EchoNetContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { ConverterProvider } from './context/ConverterContext'
import { CidProvider } from './context/CidContext'
// import { DeviceProvider } from './context/DeviceContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConverterProvider>
          <DataProvider>
            <EchoProvider>
              <CidProvider>
                {/* <DeviceProvider> */}
                  <App />
                {/* </DeviceProvider> */}
              </CidProvider>
            </EchoProvider>
          </DataProvider>
        </ConverterProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
