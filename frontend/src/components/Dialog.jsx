import "./dialog.css"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { CSSTransition } from "react-transition-group"

const Dialog = ({ isOpen, onClose, title, subtitle, footer, children }) => {
  const nodeRef = useRef()

  useEffect(() => {
    if (!isOpen) return

    const handlekeyDown = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handlekeyDown)
    return () => window.removeEventListener("keydown", handlekeyDown)
  }, [isOpen, onClose])

  const portalRoot = document.getElementById("portal-root")
  if (!portalRoot) return null

  return createPortal(
    <CSSTransition
      nodeRef={nodeRef}
      in={isOpen}
      timeout={500}
      classNames="fade"
      unmountOnExit
    >
      <div
        ref={nodeRef}
        className="fixed inset-0 flex items-center justify-center bg-black/50"
        onMouseDown={() => onClose?.()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          className="rounded-lg bg-white p-6"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-xl font-semibold text-black">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-yellow-600">{subtitle}</p>
              )}
            </div>
          )}
          {children}
          {footer && footer}
        </div>
      </div>
    </CSSTransition>,
    portalRoot
  )
}

export default Dialog
