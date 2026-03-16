import "./dialog.css"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { CSSTransition } from "react-transition-group"

const Dialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  footer,
  children,
  panelClassName = "max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl md:p-8",
}) => {
  const nodeRef = useRef()

  useEffect(() => {
    if (!isOpen) return

    const handlekeyDown = (e) => {
      if (e.key === "Escape") onClose?.()
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 py-8"
        onMouseDown={() => onClose?.()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={panelClassName} onMouseDown={(e) => e.stopPropagation()}>
          {(title || subtitle) && (
            <div className="mb-6">
              {title ? <h2 className="text-xl font-semibold text-slate-950">{title}</h2> : null}
              {subtitle ? <p className="mt-1 text-sm text-amber-700">{subtitle}</p> : null}
            </div>
          )}
          {children}
          {footer}
        </div>
      </div>
    </CSSTransition>,
    portalRoot
  )
}

export default Dialog