import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import {
  createAdminGalleryCollection,
  deleteAdminGalleryMedia,
  fetchAdminGalleryCollection,
  fetchAdminGalleryUsage,
  reorderAdminGalleryMedia,
  updateAdminGalleryCollection,
  updateAdminGalleryCover,
  updateAdminGalleryMedia,
  uploadAdminGalleryMedia,
} from '../lib/adminGallery'
import { compressGalleryFile, formatBytes, inspectGalleryFile } from '../lib/galleryCompression'

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const textareaClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const defaultFormState = {
  title: '',
  eyebrow: '',
  summary: '',
  isPublished: false,
}

function GalleryEditorPage({ mode }) {
  const isEdit = mode === 'edit'
  const navigate = useNavigate()
  const { collectionId } = useParams()

  const [form, setForm] = useState(defaultFormState)
  const [status, setStatus] = useState(isEdit ? 'loading' : 'ready')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [mediaItems, setMediaItems] = useState([])
  const [coverMediaId, setCoverMediaId] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [publishNewMedia, setPublishNewMedia] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [isDeletingMediaId, setIsDeletingMediaId] = useState('')
  const [isSavingMediaId, setIsSavingMediaId] = useState('')
  const [isReorderingMediaId, setIsReorderingMediaId] = useState('')
  const [isUpdatingCover, setIsUpdatingCover] = useState(false)

  const [galleryUsage, setGalleryUsage] = useState(null)
  const [isLoadingGalleryUsage, setIsLoadingGalleryUsage] = useState(true)
  const [galleryUsageError, setGalleryUsageError] = useState('')

  useEffect(() => {
    if (!isEdit || !collectionId) {
      return
    }

    let isMounted = true

    fetchAdminGalleryCollection(collectionId)
      .then((item) => {
        if (!isMounted) return
        setForm({
          title: item.title ?? '',
          eyebrow: item.eyebrow ?? '',
          summary: item.summary ?? '',
          isPublished: Boolean(item.isPublished),
        })
        setMediaItems(item.media ?? [])
        setCoverMediaId(item.coverMediaId ?? '')
        setStatus('ready')
      })
      .catch((error) => {
        if (!isMounted) return
        setErrorMessage(error.message)
        setStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [collectionId, isEdit])

  useEffect(() => {
    let isMounted = true

    loadGalleryUsage()
      .then((usage) => {
        if (!isMounted) return
        setGalleryUsage(usage)
        setGalleryUsageError('')
      })
      .catch((error) => {
        if (!isMounted) return
        setGalleryUsage(null)
        setGalleryUsageError(error.message)
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoadingGalleryUsage(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
    }
  }, [selectedFiles])

  const totalMediaBytes = useMemo(
    () => mediaItems.reduce((total, item) => total + Number(item.bytes || 0), 0),
    [mediaItems],
  )

  const selectedFilesTotalBytes = useMemo(
    () => selectedFiles.reduce((total, item) => total + Number(item.bytes || 0), 0),
    [selectedFiles],
  )

  const filesNeedingCompression = useMemo(
    () =>
      selectedFiles.filter(
        (item) => item.inspection.exceedsLimit || item.state === 'error',
      ),
    [selectedFiles],
  )

  const uploadReadyFiles = useMemo(
    () =>
      selectedFiles.filter(
        (item) => item.inspection.valid && !item.inspection.exceedsLimit && item.state !== 'compressing',
      ),
    [selectedFiles],
  )

  const galleryQuotaBlocked = Boolean(galleryUsage?.uploadBlocked)
  const hasPendingCompression = selectedFiles.some((item) => item.state === 'compressing')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateMediaField(mediaId, field, value) {
    setMediaItems((current) =>
      current.map((item) => (item.id === mediaId ? { ...item, [field]: value } : item)),
    )
  }

  async function handleMediaFileChange(event) {
    const nextFiles = Array.from(event.target.files || [])
    event.target.value = ''

    if (!nextFiles.length) {
      return
    }

    setErrorMessage('')
    setStatusMessage('')

    const builtFiles = await Promise.all(
      nextFiles.map((file) => buildSelectedFile(file, { isPublished: publishNewMedia, fallbackTitle: form.title })),
    )

    setSelectedFiles((current) => [...current, ...builtFiles])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setErrorMessage('')
    setStatusMessage('')
    setIsSubmitting(true)

    try {
      const payload = {
        title: form.title,
        eyebrow: form.eyebrow,
        summary: form.summary,
        isPublished: form.isPublished,
      }

      const item = isEdit
        ? await updateAdminGalleryCollection(collectionId, payload)
        : await createAdminGalleryCollection(payload)

      setStatusMessage(
        isEdit
          ? 'Gallery collection details saved successfully.'
          : 'Gallery collection created successfully.',
      )

      if (!isEdit) {
        navigate(`/gallery/${item.id}/edit`, { replace: true })
        return
      }

      setForm({
        title: item.title ?? '',
        eyebrow: item.eyebrow ?? '',
        summary: item.summary ?? '',
        isPublished: Boolean(item.isPublished),
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCompressFile(fileId) {
    const fileEntry = selectedFiles.find((item) => item.id === fileId)

    if (!fileEntry) {
      return
    }

    setSelectedFiles((current) =>
      current.map((item) =>
        item.id === fileId ? { ...item, state: 'compressing', errorMessage: '' } : item,
      ),
    )

    try {
      const compressedFile = await compressGalleryFile(fileEntry.file)
      const replacement = await buildSelectedFile(compressedFile, {
        alt: fileEntry.alt,
        caption: fileEntry.caption,
        isPublished: fileEntry.isPublished,
        fallbackTitle: form.title,
      })

      if (fileEntry.previewUrl) {
        URL.revokeObjectURL(fileEntry.previewUrl)
      }

      setSelectedFiles((current) =>
        current.map((item) =>
          item.id === fileId ? { ...replacement, id: fileId, state: 'ready' } : item,
        ),
      )
    } catch (error) {
      setSelectedFiles((current) =>
        current.map((item) =>
          item.id === fileId
            ? { ...item, state: 'error', errorMessage: error.message || 'Compression failed.' }
            : item,
        ),
      )
    }
  }

  async function handleCompressOversizedFiles() {
    for (const item of selectedFiles) {
      if (item.inspection.exceedsLimit) {
        // eslint-disable-next-line no-await-in-loop
        await handleCompressFile(item.id)
      }
    }
  }

  async function handleUploadMedia() {
    if (!collectionId) {
      setErrorMessage('Create the collection first before uploading media.')
      return
    }

    if (!uploadReadyFiles.length) {
      setErrorMessage('Select media files that are ready for upload first.')
      return
    }

    if (filesNeedingCompression.length || hasPendingCompression) {
      setErrorMessage('Finish compressing or removing oversized files before uploading.')
      return
    }

    if (galleryQuotaBlocked) {
      setErrorMessage(
        'Cloudinary storage capacity has been exhausted. Upgrade the plan before uploading more media.',
      )
      return
    }

    if (
      galleryUsage?.remainingBytes !== null &&
      selectedFilesTotalBytes > Number(galleryUsage.remainingBytes || 0)
    ) {
      setErrorMessage(
        `Only ${formatBytes(galleryUsage.remainingBytes)} remains in Cloudinary storage, so this upload cannot be completed.`,
      )
      return
    }

    setErrorMessage('')
    setStatusMessage('')
    setIsUploadingMedia(true)

    try {
      const payloadFiles = await Promise.all(
        uploadReadyFiles.map(async (item) => ({
          fileData: await readFileAsDataUrl(item.file),
          fileName: item.file.name,
          mimeType: item.mimeType,
          bytes: item.bytes,
          alt: item.alt,
          caption: item.caption,
          isPublished: item.isPublished,
        })),
      )

      const uploadedItems = await uploadAdminGalleryMedia(collectionId, { files: payloadFiles })
      const existingIds = new Set(uploadReadyFiles.map((item) => item.id))

      setMediaItems((current) =>
        [...current, ...uploadedItems].sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0)),
      )
      setSelectedFiles((current) => {
        current.forEach((item) => {
          if (existingIds.has(item.id) && item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl)
          }
        })
        return current.filter((item) => !existingIds.has(item.id))
      })
      setStatusMessage(
        uploadedItems.length === 1
          ? '1 media file uploaded successfully.'
          : `${uploadedItems.length} media files uploaded successfully.`,
      )

      const usage = await loadGalleryUsage()
      setGalleryUsage(usage)
      setGalleryUsageError('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsUploadingMedia(false)
    }
  }

  async function handleDeleteMedia(mediaId) {
    if (!collectionId) return

    setErrorMessage('')
    setStatusMessage('')
    setIsDeletingMediaId(mediaId)

    try {
      await deleteAdminGalleryMedia(collectionId, mediaId)
      setMediaItems((current) => current.filter((item) => item.id !== mediaId))

      if (coverMediaId === mediaId) {
        setCoverMediaId('')
      }

      setStatusMessage('Media file removed successfully.')

      const usage = await loadGalleryUsage()
      setGalleryUsage(usage)
      setGalleryUsageError('')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsDeletingMediaId('')
    }
  }

  async function handleSaveMedia(mediaId) {
    if (!collectionId) return

    const mediaItem = mediaItems.find((item) => item.id === mediaId)

    if (!mediaItem) {
      return
    }

    setErrorMessage('')
    setStatusMessage('')
    setIsSavingMediaId(mediaId)

    try {
      const updatedItem = await updateAdminGalleryMedia(collectionId, mediaId, {
        alt: mediaItem.alt,
        caption: mediaItem.caption,
        isPublished: mediaItem.isPublished,
      })

      setMediaItems((current) => current.map((item) => (item.id === mediaId ? updatedItem : item)))
      setStatusMessage('Gallery media details saved successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSavingMediaId('')
    }
  }

  async function handleMoveMedia(mediaId, direction) {
    if (!collectionId) return

    const currentIndex = mediaItems.findIndex((item) => item.id === mediaId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= mediaItems.length) {
      return
    }

    const nextItems = [...mediaItems]
    const [movedItem] = nextItems.splice(currentIndex, 1)
    nextItems.splice(targetIndex, 0, movedItem)

    setErrorMessage('')
    setStatusMessage('')
    setIsReorderingMediaId(mediaId)

    try {
      const reorderedItems = await reorderAdminGalleryMedia(
        collectionId,
        nextItems.map((item) => item.id),
      )
      setMediaItems(reorderedItems)
      setStatusMessage('Gallery media order updated successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsReorderingMediaId('')
    }
  }

  async function handleSetCover(mediaId) {
    if (!collectionId) return

    setErrorMessage('')
    setStatusMessage('')
    setIsUpdatingCover(true)

    try {
      const updatedCollection = await updateAdminGalleryCover(
        collectionId,
        coverMediaId === mediaId ? '' : mediaId,
      )

      setCoverMediaId(updatedCollection.coverMediaId ?? '')
      setStatusMessage(
        updatedCollection.coverMediaId
          ? 'Collection cover updated successfully.'
          : 'Collection cover cleared successfully.',
      )
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsUpdatingCover(false)
    }
  }

  if (status === 'loading') {
    return (
      <SectionCard
        eyebrow="Gallery"
        title="Loading gallery collection"
        description="Fetching the latest collection details and media library."
      />
    )
  }

  if (status === 'error') {
    return (
      <SectionCard
        eyebrow="Gallery"
        title="Unable to open this collection"
        description={errorMessage || 'The collection could not be loaded right now.'}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Gallery"
        title={isEdit ? 'Edit gallery collection' : 'Create gallery collection'}
        description="Manage collection details, control the visual cover, upload media in batches, and maintain a polished gallery library for the website."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Collection status" value={form.isPublished ? 'Published' : 'Draft'} />
          <MetricCard label="Media files" value={String(mediaItems.length)} />
          <MetricCard label="Library size" value={formatBytes(totalMediaBytes)} />
        </div>
      </SectionCard>

      {errorMessage ? (
        <div className="rounded-[24px] border border-[#ffb4a2]/20 bg-[#5a2318]/20 px-5 py-4 text-sm text-[#ffd5ca]">
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#3d3314]/20 px-5 py-4 text-sm text-[#f6dd86]">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
        <SectionCard
          eyebrow="Collection details"
          title="Collection information"
          description="These details shape how the gallery collection appears in the admin panel and on the website."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm text-[#d5dfda]">Collection title</span>
              <input
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className={inputClassName}
                placeholder="Monsoon ride highlights"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[#d5dfda]">Eyebrow</span>
              <input
                value={form.eyebrow}
                onChange={(event) => updateField('eyebrow', event.target.value)}
                className={inputClassName}
                placeholder="Community gallery"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[#d5dfda]">Summary</span>
              <textarea
                value={form.summary}
                onChange={(event) => updateField('summary', event.target.value)}
                className={textareaClassName}
                rows={5}
                placeholder="Introduce this gallery collection for visitors and team members."
              />
            </label>

            <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => updateField('isPublished', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#f8d35c] focus:ring-[#f8d35c]"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-white">Published</span>
                <span className="block text-sm text-[#91a39a]">
                  Published collections can be surfaced to the website once public gallery integration reads them.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex rounded-2xl bg-[#f8d35c] px-5 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Saving collection...' : isEdit ? 'Save collection' : 'Create collection'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Storage"
          title="Cloudinary usage"
          description="Review available storage before adding more gallery media to the library."
        >
          <GalleryUsageNotice
            usage={galleryUsage}
            isLoading={isLoadingGalleryUsage}
            errorMessage={galleryUsageError}
            selectedBytes={selectedFilesTotalBytes}
          />
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Upload queue"
        title="Add media to this collection"
        description={
          isEdit
            ? 'Select one or more images or videos, compress oversized files when needed, and upload the finished batch to this collection.'
            : 'Create the collection first, then return here to upload images and videos into the media library.'
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <label className="block space-y-2">
              <span className="text-sm text-[#d5dfda]">Select media files</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={handleMediaFileChange}
                disabled={!isEdit}
                className="block w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-[#b7c6bf] file:mr-4 file:rounded-xl file:border-0 file:bg-[#f8d35c] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#1b1b12] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
              <input
                type="checkbox"
                checked={publishNewMedia}
                onChange={(event) => {
                  const nextValue = event.target.checked
                  setPublishNewMedia(nextValue)
                  setSelectedFiles((current) =>
                    current.map((item) => ({ ...item, isPublished: nextValue })),
                  )
                }}
                className="h-4 w-4 rounded border-white/20 bg-transparent text-[#f8d35c] focus:ring-[#f8d35c]"
              />
              <span className="text-sm text-[#d5dfda]">Publish new uploads by default</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCompressOversizedFiles}
              disabled={!filesNeedingCompression.length || hasPendingCompression}
              className="inline-flex rounded-2xl border border-[#f8d35c]/30 bg-[#201c10] px-4 py-3 text-sm font-medium text-[#f8d35c] transition hover:bg-[#2d2616] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Compress oversized files
            </button>
            <button
              type="button"
              onClick={handleUploadMedia}
              disabled={!isEdit || !uploadReadyFiles.length || filesNeedingCompression.length > 0 || hasPendingCompression || isUploadingMedia}
              className="inline-flex rounded-2xl bg-[#f8d35c] px-5 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingMedia ? 'Uploading media...' : 'Upload ready files'}
            </button>
          </div>

          {selectedFiles.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {selectedFiles.map((item) => (
                <SelectedFileCard
                  key={item.id}
                  file={item}
                  onChange={(field, value) =>
                    setSelectedFiles((current) =>
                      current.map((entry) => (entry.id === item.id ? { ...entry, [field]: value } : entry)),
                    )
                  }
                  onCompress={() => handleCompressFile(item.id)}
                  onRemove={() =>
                    setSelectedFiles((current) => {
                      const nextItems = current.filter((entry) => entry.id !== item.id)
                      if (item.previewUrl) {
                        URL.revokeObjectURL(item.previewUrl)
                      }
                      return nextItems
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-5 py-8 text-sm text-[#91a39a]">
              No files are waiting in the upload queue yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Media library"
        title="Collection media"
        description="Set the collection cover, fine-tune captions and alt text, and keep the media order ready for public presentation."
      >
        {mediaItems.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {mediaItems.map((item, index) => {
              const isCover = coverMediaId === item.id
              const busy = isDeletingMediaId === item.id || isSavingMediaId === item.id || isReorderingMediaId === item.id

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[26px] border border-white/10 bg-white/5"
                >
                  <div className="relative aspect-[4/3] bg-[#0f1513]">
                    {item.type === 'image' ? (
                      <img
                        src={item.secureUrl || item.url}
                        alt={item.alt || form.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.secureUrl || item.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/15 bg-[#07100d]/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f8d35c]">
                        {item.type}
                      </span>
                      <span className="rounded-full border border-white/15 bg-[#07100d]/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                      {isCover ? (
                        <span className="rounded-full border border-[#f8d35c]/40 bg-[#3d3314]/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f8d35c]">
                          Cover
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm text-[#d5dfda]">Alt text</span>
                        <input
                          value={item.alt || ''}
                          onChange={(event) => updateMediaField(item.id, 'alt', event.target.value)}
                          className={inputClassName}
                          placeholder="Describe this media"
                        />
                      </label>

                      <label className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-[#0f1513] px-4 py-4">
                        <input
                          type="checkbox"
                          checked={Boolean(item.isPublished)}
                          onChange={(event) => updateMediaField(item.id, 'isPublished', event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#f8d35c] focus:ring-[#f8d35c]"
                        />
                        <span className="space-y-1">
                          <span className="block text-sm font-medium text-white">Published</span>
                          <span className="block text-sm text-[#91a39a]">
                            Toggle whether this media item is ready for the website.
                          </span>
                        </span>
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm text-[#d5dfda]">Caption</span>
                      <textarea
                        value={item.caption || ''}
                        onChange={(event) => updateMediaField(item.id, 'caption', event.target.value)}
                        className={textareaClassName}
                        rows={4}
                        placeholder="Optional caption for this gallery item"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <StatPill label="Size" value={formatBytes(item.bytes)} />
                      <StatPill label="Format" value={item.format || 'Unknown'} />
                      <StatPill
                        label="Updated"
                        value={item.updatedAt ? formatDateTime(item.updatedAt) : 'Just now'}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleSetCover(item.id)}
                        disabled={isUpdatingCover || busy}
                        className="inline-flex rounded-2xl border border-[#f8d35c]/30 bg-[#201c10] px-4 py-3 text-sm font-medium text-[#f8d35c] transition hover:bg-[#2d2616] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdatingCover && isCover
                          ? 'Updating cover...'
                          : isCover
                            ? 'Clear cover'
                            : 'Set as cover'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'up')}
                        disabled={index === 0 || busy}
                        className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Move up
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveMedia(item.id, 'down')}
                        disabled={index === mediaItems.length - 1 || busy}
                        className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Move down
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveMedia(item.id)}
                        disabled={busy}
                        className="inline-flex rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingMediaId === item.id ? 'Saving...' : 'Save changes'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        disabled={busy}
                        className="inline-flex rounded-2xl border border-[#ffb4a2]/30 bg-[#3a1814] px-4 py-3 text-sm font-medium text-[#ffd5ca] transition hover:bg-[#4c1f1b] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeletingMediaId === item.id ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-5 py-8 text-sm text-[#91a39a]">
            No media has been uploaded to this collection yet.
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[#91a39a]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#0f1513] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#91a39a]">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  )
}

function GalleryUsageNotice({ usage, isLoading, errorMessage, selectedBytes }) {
  if (isLoading) {
    return (
      <div className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-5 text-sm text-[#b7c6bf]">
        Checking Cloudinary storage usage...
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-[22px] border border-[#ffb4a2]/20 bg-[#5a2318]/20 px-5 py-5 text-sm text-[#ffd5ca]">
        {errorMessage}
      </div>
    )
  }

  if (!usage) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatPill label="Used" value={formatBytes(usage.storageUsedBytes)} />
        <StatPill
          label="Remaining"
          value={
            usage.remainingBytes === null ? 'Plan limit unavailable' : formatBytes(usage.remainingBytes)
          }
        />
      </div>

      {selectedBytes > 0 ? (
        <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-[#d5dfda]">
          Current upload queue: <span className="font-medium text-white">{formatBytes(selectedBytes)}</span>
        </div>
      ) : null}

      {usage.uploadBlocked ? (
        <div className="rounded-[20px] border border-[#ffb4a2]/20 bg-[#5a2318]/20 px-4 py-4 text-sm text-[#ffd5ca]">
          Cloudinary storage is fully used. Upgrade the plan before uploading more gallery media.
        </div>
      ) : usage.nearLimit ? (
        <div className="rounded-[20px] border border-[#f8d35c]/20 bg-[#3d3314]/20 px-4 py-4 text-sm text-[#f6dd86]">
          Cloudinary storage is nearly full. Review the remaining capacity before uploading another batch.
        </div>
      ) : (
        <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-[#b7c6bf]">
          Storage is healthy. The editor will still block uploads automatically if a batch would exceed the remaining Cloudinary capacity.
        </div>
      )}
    </div>
  )
}

function SelectedFileCard({ file, onChange, onCompress, onRemove }) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
      <div className="aspect-[4/3] bg-[#0f1513]">
        {file.kind === 'image' && file.previewUrl ? (
          <img src={file.previewUrl} alt={file.alt || file.name} className="h-full w-full object-cover" />
        ) : file.kind === 'video' && file.previewUrl ? (
          <video src={file.previewUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#91a39a]">Preview unavailable</div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-[#0f1513] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f8d35c]">
            {file.kind || 'file'}
          </span>
          <span className="rounded-full border border-white/10 bg-[#0f1513] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
            {formatBytes(file.bytes)}
          </span>
          {file.inspection.exceedsLimit ? (
            <span className="rounded-full border border-[#ffb4a2]/30 bg-[#3a1814] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#ffd5ca]">
              Exceeds limit
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-medium text-white">{file.name}</p>
          <p className="mt-1 text-sm text-[#91a39a]">{file.mimeType || 'Unknown type'}</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-[#d5dfda]">Alt text</span>
          <input
            value={file.alt}
            onChange={(event) => onChange('alt', event.target.value)}
            className={inputClassName}
            placeholder="Describe this media"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-[#d5dfda]">Caption</span>
          <textarea
            value={file.caption}
            onChange={(event) => onChange('caption', event.target.value)}
            className={textareaClassName}
            rows={3}
            placeholder="Optional caption"
          />
        </label>

        <label className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-[#0f1513] px-4 py-4">
          <input
            type="checkbox"
            checked={file.isPublished}
            onChange={(event) => onChange('isPublished', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#f8d35c] focus:ring-[#f8d35c]"
          />
          <span className="space-y-1">
            <span className="block text-sm font-medium text-white">Publish on upload</span>
            <span className="block text-sm text-[#91a39a]">
              Decide whether this media item should be ready for the website immediately after upload.
            </span>
          </span>
        </label>

        {file.errorMessage || file.inspection.message ? (
          <div className="rounded-[18px] border border-[#ffb4a2]/20 bg-[#5a2318]/20 px-4 py-3 text-sm text-[#ffd5ca]">
            {file.errorMessage || file.inspection.message}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCompress}
            disabled={!file.inspection.canCompress || file.state === 'compressing'}
            className="inline-flex rounded-2xl border border-[#f8d35c]/30 bg-[#201c10] px-4 py-3 text-sm font-medium text-[#f8d35c] transition hover:bg-[#2d2616] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {file.state === 'compressing' ? 'Compressing...' : 'Compress file'}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}

async function buildSelectedFile(file, { alt = '', caption = '', isPublished = false, fallbackTitle = '' } = {}) {
  const inspection = inspectGalleryFile(file)
  const previewUrl = URL.createObjectURL(file)

  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    mimeType: file.type,
    kind: inspection.kind,
    bytes: file.size,
    alt: alt || deriveAltFromFileName(file.name, fallbackTitle),
    caption,
    isPublished,
    previewUrl,
    inspection,
    state: inspection.exceedsLimit ? 'error' : 'ready',
    errorMessage: '',
  }
}

function deriveAltFromFileName(fileName, fallbackTitle) {
  const baseName = String(fileName || '')
    .trim()
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')

  return baseName || fallbackTitle || 'Gallery media'
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(`Unable to read "${file.name}" for upload.`))
    reader.readAsDataURL(file)
  })
}

async function loadGalleryUsage() {
  return fetchAdminGalleryUsage()
}

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return 'Recently updated'
  }
}

export default GalleryEditorPage
