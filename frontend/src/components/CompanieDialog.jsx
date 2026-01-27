import { createPortal } from "react-dom"

const CompanieDialog = ({ isOpen, children }) => {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="rounded-lg bg-white p-6">{children}</div>
    </div>,

    document.getElementById("portal-root"),
    console.log(document.getElementById("portal-root"))
  )
}

export default CompanieDialog
