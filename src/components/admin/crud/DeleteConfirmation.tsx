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
  message = "Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cet élément ?"
}: DeleteConfirmationProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900">
              Supprimer {itemName}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 text-center">
                {message}
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
