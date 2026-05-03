import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/quicktime']

let ffmpegPromise = null

export function inspectGalleryFile(file) {
  const mimeType = String(file?.type || '').trim().toLowerCase()
  const name = String(file?.name || 'This file')
  const bytes = Number(file?.size || 0)
  const kind = getGalleryFileKind(mimeType)

  if (!kind) {
    return {
      valid: false,
      name,
      mimeType,
      bytes,
      kind: '',
      maxBytes: 0,
      exceedsLimit: false,
      canCompress: false,
      message: `"${name}" is not a supported gallery format. Use JPG, JPEG, PNG, WEBP, MP4, or MOV files.`,
    }
  }

  const maxBytes = kind === 'image' ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES
  const exceedsLimit = bytes > maxBytes

  return {
    valid: true,
    name,
    mimeType,
    bytes,
    kind,
    maxBytes,
    exceedsLimit,
    canCompress: exceedsLimit,
    message: exceedsLimit
      ? `"${name}" exceeds the ${formatBytes(maxBytes)} ${kind} upload limit and should be compressed before upload.`
      : '',
  }
}

export async function compressGalleryFile(file) {
  const inspection = inspectGalleryFile(file)

  if (!inspection.valid) {
    throw new Error(inspection.message)
  }

  if (!inspection.exceedsLimit) {
    return file
  }

  if (inspection.kind === 'image') {
    return compressImageFile(file, inspection.maxBytes)
  }

  return compressVideoFile(file, inspection.maxBytes)
}

export function getGalleryFileKind(mimeType = '') {
  const normalizedMimeType = String(mimeType || '').trim().toLowerCase()

  if (ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMimeType)) {
    return 'image'
  }

  if (ALLOWED_VIDEO_MIME_TYPES.includes(normalizedMimeType)) {
    return 'video'
  }

  return ''
}

export function formatBytes(bytes = 0) {
  const size = Number(bytes || 0)

  if (size <= 0) {
    return '0 MB'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / 1024 ** unitIndex

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`
}

async function compressImageFile(file, maxBytes) {
  const imageSource = await loadImageSource(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: true })

  if (!context) {
    throw new Error('Image compression is not available in this browser.')
  }

  let width = imageSource.width
  let height = imageSource.height
  let quality = 0.9
  let attempt = 0
  let compressedBlob = null

  try {
    while (attempt < 8) {
      canvas.width = width
      canvas.height = height
      context.clearRect(0, 0, width, height)
      context.drawImage(imageSource.source, 0, 0, width, height)

      compressedBlob = await canvasToBlob(canvas, 'image/webp', quality)

      if (compressedBlob.size <= maxBytes) {
        return new File([compressedBlob], replaceExtension(file.name, 'webp'), {
          type: 'image/webp',
          lastModified: Date.now(),
        })
      }

      quality = Math.max(0.45, quality - 0.1)
      width = Math.max(Math.round(width * 0.88), 960)
      height = Math.max(Math.round(height * 0.88), 540)
      attempt += 1
    }
  } finally {
    imageSource.close()
  }

  throw new Error(
    `Compressed image is still larger than ${formatBytes(maxBytes)}. Please choose a smaller file.`,
  )
}

async function compressVideoFile(file, maxBytes) {
  const ffmpeg = await getFfmpeg()
  const inputExtension = getFileExtension(file.name) || 'mp4'
  const inputName = `input-${crypto.randomUUID()}.${inputExtension}`
  const outputName = `output-${crypto.randomUUID()}.mp4`

  await ffmpeg.writeFile(inputName, await fetchFile(file))

  try {
    await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      'scale=w=min(1920,iw):h=-2',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '30',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      outputName,
    ])

    const data = await ffmpeg.readFile(outputName)
    const compressedBytes = data instanceof Uint8Array ? data : new Uint8Array(data)
    const compressedFile = new File([compressedBytes], replaceExtension(file.name, 'mp4'), {
      type: 'video/mp4',
      lastModified: Date.now(),
    })

    if (compressedFile.size > maxBytes) {
      throw new Error(
        `Compressed video is still larger than ${formatBytes(maxBytes)}. Please choose a smaller file.`,
      )
    }

    return compressedFile
  } catch (error) {
    throw new Error(error?.message || 'Video compression could not be completed.')
  } finally {
    await Promise.all([
      ffmpeg.deleteFile(inputName).catch(() => {}),
      ffmpeg.deleteFile(outputName).catch(() => {}),
    ])
  }
}

async function getFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg()
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      return ffmpeg
    })()
  }

  return ffmpegPromise
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to compress this image.'))
        return
      }

      resolve(blob)
    }, type, quality)
  })
}

async function loadImageSource(file) {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)

    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close?.(),
    }
  }

  const image = await loadImageElement(file)

  return {
    source: image,
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    close() {},
  }
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to open this image for compression.'))
    }

    image.src = objectUrl
  })
}

function getFileExtension(fileName = '') {
  const match = String(fileName || '').match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1].toLowerCase() : ''
}

function replaceExtension(fileName, extension) {
  const baseName = String(fileName || 'file').replace(/\.[^/.]+$/, '')
  return `${baseName}.${extension}`
}
