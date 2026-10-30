import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DetailPage } from './gallery/DetailPage'
import { HomePage } from './gallery/HomePage'
import { Layout } from './gallery/Layout'
import { StandalonePreviewPage } from './gallery/StandalonePreviewPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="preview/*" element={<StandalonePreviewPage />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="c/*" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
