import { AppSidebar } from "./components/AppSidebar";
import { schoolBranding } from "./config/school";
import { mockSidebarUser } from "./dev/mock-session";
export default function App() {
  return <div className="sidebar-demo"><AppSidebar user={mockSidebarUser} school={schoolBranding} /></div>;
}