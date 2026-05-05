import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/Routes'
import {Toster} from 'react-hot-toast'
function App() {
  return (
    
    <BrowserRouter>
    <Toaster />
    <AppRoutes/>
    </BrowserRouter>
  )
}

export default App