import Sidebar from "./components/Sidebar.jsx"
import Companies from "./components/Companies.jsx"
import { Toaster } from "sonner"

export default function App() {
  return (
    <div className="flex">
      <Toaster richColors position="top-center" />
      <Sidebar />
      <Companies />
    </div>
  )
}
