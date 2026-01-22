import { Toaster } from "sonner"

import Companies from "./components/Companies.jsx"
import Sidebar from "./components/Sidebar.jsx"

export default function App() {
  return (
    <div className="flex">
      <Toaster richColors position="top-center" />
      <Sidebar />
      <Companies />
    </div>
  )
}
