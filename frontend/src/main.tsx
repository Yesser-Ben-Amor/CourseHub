import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Campus from './Campus.tsx'
import AdminLogin from './AdminLogin.tsx'
import AdminDashboard from './AdminDashboard.tsx'
import LiveSeminar from './components/LiveSeminar/LiveSeminar.tsx'
import Library from './components/Library/Library.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/campus" element={<Campus />} />
      <Route path="/live-seminar/:seminarId" element={<LiveSeminar />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/library" element={<Library />} />
    </Routes>
  </BrowserRouter>,
)
