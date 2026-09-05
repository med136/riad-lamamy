'use client'

import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  message?: string
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  message = "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet élément ?",
}: DeleteConfirmationProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <button
          type="button"
          aria-label="Fermer"
          className="fixed inset-0 bg-[#17130F]/35 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[24px] border border-[#B28A47]/20 bg-[#FFFDF8] shadow-[0_32px_90px_-38px_rgba(43,28,23,.55)]">
          <div className="px-6 pb-5 pt-7 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-rose-50">
              <AlertTriangle className="h-5 w-5 text-rose-600" strokeWidth={1.7} />
            </div>
            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B28A47]">
              Confirmation
            </p>
            <h3 className="mt-1 font-serif text-[24px] font-medium text-[#2B1C17]">
              Supprimer {itemName}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-[#6F625C]">{message}</p>
          </div>

          <div className="flex justify-center gap-3 border-t border-[#B28A47]/15 bg-[#F8F5EF]/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-full border border-[#B28A47]/22 bg-[#FFFDF8] px-5 text-[12px] font-semibold text-[#5D514C] transition hover:border-[#B28A47]/40"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="h-10 rounded-full border border-rose-300 bg-rose-600 px-5 text-[12px] font-semibold text-white transition hover:bg-rose-700"
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
