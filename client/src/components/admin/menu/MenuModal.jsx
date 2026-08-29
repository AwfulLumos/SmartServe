import { createPortal } from "react-dom";

export default function MenuModal({ onClose, children }) {
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      {/* Modal Content Box */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {children}
      </div>
    </div>,
    document.body
  );
}
