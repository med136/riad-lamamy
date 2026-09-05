'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <button
          type="button"
          aria-label="Fermer"
          className="fixed inset-0 bg-[#17130F]/35 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <div
          className={`relative z-10 w-full ${sizeClasses[size]} overflow-hidden rounded-[24px] border border-[#B28A47]/20 bg-[#FFFDF8] text-left shadow-[0_32px_90px_-38px_rgba(43,28,23,.55)]`}
        >
          <div className="flex items-center justify-between border-b border-[#B28A47]/15 px-6 py-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B28A47]">
                Dar LaMamy
              </p>
              <h3 className="mt-1 font-serif text-[24px] font-medium text-[#2B1C17]">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B28A47]/18 bg-[#F8F5EF] text-[#6F625C] transition hover:border-[#B28A47]/35 hover:text-[#0F5A46]"
            >
              <X size={17} strokeWidth={1.6} />
            </button>
          </div>

          <div className="max-h-[68vh] overflow-y-auto px-6 py-5">{children}</div>

          <div className="flex justify-end gap-3 border-t border-[#B28A47]/15 bg-[#F8F5EF]/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-full border border-[#B28A47]/22 bg-[#FFFDF8] px-5 text-[12px] font-semibold text-[#5D514C] transition hover:border-[#B28A47]/40 hover:bg-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="crud-form"
              className="h-10 rounded-full border border-[#D2AA5A]/40 bg-[#0F5A46] px-5 text-[12px] font-semibold text-[#FFFDF8] transition hover:bg-[#083D31]"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
