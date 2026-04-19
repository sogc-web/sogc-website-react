import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminsPage from './pages/AdminsPage'
import EventsPage from './pages/EventsPage'
import EventEditorPage from './pages/EventEditorPage'
import EventShowPage from './pages/EventShowPage'
import GalleryPage from './pages/GalleryPage'
import GalleryEditorPage from './pages/GalleryEditorPage'
import PopupPage from './pages/PopupPage'
import PopupsPage from './pages/PopupsPage'
import PopupShowPage from './pages/PopupShowPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/new" element={<EventEditorPage mode="create" />} />
        <Route path="events/:eventId" element={<EventShowPage />} />
        <Route path="events/:eventId/edit" element={<EventEditorPage mode="edit" />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="gallery/new" element={<GalleryEditorPage mode="create" />} />
        <Route path="gallery/:collectionId/edit" element={<GalleryEditorPage mode="edit" />} />
        <Route path="popup" element={<PopupsPage />} />
        <Route path="popup/new" element={<PopupPage mode="create" />} />
        <Route path="popup/:popupId" element={<PopupShowPage />} />
        <Route path="popup/:popupId/edit" element={<PopupPage mode="edit" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
