import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
// import QRCodeScanner from "./pages/QRCodeScanner"; // Removed
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentVisitEntry from "@/pages/StudentVisitEntry"; // Updated import
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import AdminBookManagement from "./pages/admin/AdminBookManagement";
import AdminCategoryManagement from "./pages/admin/AdminCategoryManagement";
import AdminStudentManagement from "./pages/admin/AdminStudentManagement";
import AdminCirculationManagement from "./pages/admin/AdminCirculationManagement";
import AdminVisitorManagement from "./pages/admin/AdminVisitorManagement"; // Updated import
import AdminFineManagement from "./pages/admin/AdminFineManagement"; // New: Fine Management
// import AdminQRCodeAbsensi from "./pages/admin/AdminQRCodeAbsensi"; // Removed
import AdminReportPage from "./pages/admin/AdminReportPage";
import AdminExportPage from "./pages/admin/AdminExportPage";
import AdminLogPage from "./pages/admin/AdminLogPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import { StudentAuthProvider } from "./context/StudentAuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Removed shadcn/ui Toaster, now only using Sonner */}
      <Sonner />
      <BrowserRouter>
        <StudentAuthProvider>
          <AdminAuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="/qr-code-scanner" element={<QRCodeScanner />} /> */} {/* Removed */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/student-visit-entry" element={<StudentVisitEntry />} /> {/* Updated route */}

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardOverview />} />
                <Route path="dashboard" element={<AdminDashboardOverview />} />
                <Route path="books" element={<AdminBookManagement />} />
                <Route path="categories" element={<AdminCategoryManagement />} />
                <Route path="students" element={<AdminStudentManagement />} />
                <Route path="circulation" element={<AdminCirculationManagement />} />
                <Route path="visitor-management" element={<AdminVisitorManagement />} />
                <Route path="fines" element={<AdminFineManagement />} /> {/* New: Fine Management Route */}
                {/* <Route path="qr-absensi" element={<AdminQRCodeAbsensi />} */} {/* Removed */}
                <Route path="reports" element={<AdminReportPage />} />
                <Route path="export" element={<AdminExportPage />} />
                <Route path="log" element={<AdminLogPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminAuthProvider>
        </StudentAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;