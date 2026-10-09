import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import {
  Landing,
  LoginPage,
  SignupPage,
  DashboardPage,
  UploadPage,
  TranslatePage,
  FaqPage,
  NotFoundPage,
  ReportAnalysisPage,
  AskMyReportPage,
  HealthGlossaryPage,
  MyReportsPage,
} from '@/pages'

// Demo Analysis — accessible without a reportId param
const DemoAnalysisPage = () => <ReportAnalysisPage />
const AskPage = () => <AskMyReportPage />
const SettingsPage = () => (
  <div className="py-8 text-center text-slate-500 text-sm">Settings — coming soon</div>
)

export function App() {
  return (
    <Routes>
      {/* Dark Cinematic Landing Experience */}
      <Route path="/" element={<Landing />} />

      {/* Auth Flows */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Clean Healthcare Dashboard Experience */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="reports" element={<MyReportsPage />} />
        <Route path="reports/:reportId" element={<ReportAnalysisPage />} />
        <Route path="analysis/:reportId" element={<ReportAnalysisPage />} />
        <Route path="analysis" element={<DemoAnalysisPage />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="glossary" element={<HealthGlossaryPage />} />
        <Route path="translate" element={<TranslatePage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
