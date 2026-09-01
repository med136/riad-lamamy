export type UploadProgressHandler = (percentage: number) => void

export function uploadFormDataWithProgress<T>(
  url: string,
  formData: FormData,
  onProgress: UploadProgressHandler,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', url)
    request.responseType = 'text'

    request.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return
      onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)))
    })

    request.addEventListener('load', () => {
      let payload: unknown = null
      try {
        payload = request.responseText ? JSON.parse(request.responseText) : null
      } catch {
        payload = null
      }

      if (request.status >= 200 && request.status < 300) {
        onProgress(100)
        resolve(payload as T)
        return
      }

      const apiMessage =
        payload && typeof payload === 'object' && 'error' in payload
          ? String((payload as { error: unknown }).error)
          : null
      const tooLarge =
        request.status === 413 ||
        /request entity too large|payload too large|body exceeded/i.test(request.responseText)
      reject(
        new Error(
          tooLarge
            ? 'Le serveur a refusé la taille du fichier (HTTP 413). Vérifiez client_max_body_size côté Nginx.'
            : apiMessage || `Échec de l’upload (${request.status || 'réseau'})`,
        ),
      )
    })

    request.addEventListener('error', () => reject(new Error('Connexion interrompue pendant l’upload.')))
    request.addEventListener('abort', () => reject(new Error('Upload annulé.')))
    request.send(formData)
  })
}
