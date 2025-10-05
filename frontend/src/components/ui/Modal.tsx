import React, { useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
  footer,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--color-overlay-backdrop)] backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`
          relative w-full ${sizeStyles[size]}
          bg-[var(--color-surface-primary)]
          border border-[var(--color-border-primary)]
          rounded-2xl shadow-2xl
          max-h-[90vh] overflow-hidden
          animate-slide-up
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-[var(--color-border-primary)]">
            <div className="flex-1">
              {title && (
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;