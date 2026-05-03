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
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [isDeletingMediaId, setIsDeletingMediaId] = useState('')
  const [isSavingMediaId, setIsSavingMediaId] = useState('')
  const [isReorderingMediaId, setIsReorderingMediaId] = useState('')
  const [isUpdatingCover, setIsUpdatingCover] = useState(false)
  const [selectedMediaIds, setSelectedMediaIds] = useState([])
  const [activeMediaId, setActiveMediaId] = useState('')

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
    () => selectedFiles.filter((item) => item.inspection.exceedsLimit || item.state === 'error'),
    [selectedFiles],
  )

  const uploadReadyFiles = useMemo(
    () =>
      selectedFiles.filter(
        (item) => item.inspection.valid && !item.inspection.exceedsLimit && item.state !== 'compressing',
      ),
    [selectedFiles],
  )

  const activeMedia = useMemo(
    () => mediaItems.find((item) => item.id === activeMediaId) ?? null,
    [activeMediaId, mediaItems],
  )

  const galleryQuotaBlocked = Boolean(galleryUsage?.uploadBlocked)
  const hasPendingCompression = selectedFiles.some((item) => item.state === 'compressing')
  const allSelectedInLibrary = mediaItems.length > 0 && selectedMediaIds.length === mediaItems.length

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateMediaField(mediaId, field, value) {
    setMediaItems((current) =>
      current.map((item) => (item.id === mediaId ? { ...item, [field]: value } : item)),
    )
  }

  function syncCollectionState(item) {
    setForm({
      title: item.title ?? '',
      eyebrow: item.eyebrow ?? '',
      summary: item.summary ?? '',
      isPublished: Boolean(item.isPublished),
    })
    setMediaItems(item.media ?? [])
    setCoverMediaId(item.coverMediaId ?? '')
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
      nextFiles.map((file) => buildSelectedFile(file, { fallbackTitle: form.title })),
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

      syncCollectionState(item)
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
        })),
      )

      const uploadedItems = await uploadAdminGalleryMedia(collectionId, { files: payloadFiles })
      const existingIds = new Set(uploadReadyFiles.map((item) => item.id))

      setMediaItems((current) =>
        [...current, ...uploadedItems].sort(
          (left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0),
        ),
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
      setSelectedMediaIds((current) => current.filter((id) => id !== mediaId))

      if (coverMediaId === mediaId) {
        setCoverMediaId('')
      }

      if (activeMediaId === mediaId) {
        setActiveMediaId('')
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

  async function handleDeleteSelectedMedia() {
    if (!selectedMediaIds.length) {
      return
    }

    setErrorMessage('')
    setStatusMessage('')

    try {
      for (const mediaId of selectedMediaIds) {
        // eslint-disable-next-line no-await-in-loop
        await deleteAdminGalleryMedia(collectionId, mediaId)
      }

      setMediaItems((current) => current.filter((item) => !selectedMediaIds.includes(item.id)))
      setSelectedMediaIds([])
      setStatusMessage('Selected media files removed successfully.')

      if (selectedMediaIds.includes(activeMediaId)) {
        setActiveMediaId('')
      }

      if (selectedMediaIds.includes(coverMediaId)) {
        setCoverMediaId('')
      }

      const usage = await loadGalleryUsage()
      setGalleryUsage(usage)
      setGalleryUsageError('')
    } catch (error) {
      setErrorMessage(error.message)
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

      syncCollectionState(updatedCollection)
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

  function handleToggleSelectMedia(mediaId) {
    setSelectedMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId],
    )
  }

  function handleToggleSelectAllMedia() {
    setSelectedMediaIds(allSelectedInLibrary ? [] : mediaItems.map((item) => item.id))
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
              <span className="admin-toggle mt-0.5">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => updateField('isPublished', event.target.checked)}
                  className="admin-toggle__input"
                />
                <span className="admin-toggle__track">
                  <span className="admin-toggle__thumb" />
                </span>
              </span>
              <span className="space-y-1">
                <span className="block text-sm font-medium text-white">Publish entire collection</span>
                <span className="block text-sm text-[#91a39a]">
                  This single switch controls whether the whole collection and all uploaded media are available on the website.
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
              disabled={
                !isEdit ||
                !uploadReadyFiles.length ||
                filesNeedingCompression.length > 0 ||
                hasPendingCompression ||
                isUploadingMedia
              }
              className="inline-flex rounded-2xl bg-[#f8d35c] px-5 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingMedia ? 'Uploading media...' : 'Upload ready files'}
            </button>
          </div>

          {selectedFiles.length ? (
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-white/5 text-[#91a39a]">
                    <tr>
                      <th className="px-4 py-3 font-medium">File</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {selectedFiles.map((item) => (
                      <tr key={item.id} className="align-top text-[#d5dfda]">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-[#91a39a]">{item.mimeType || 'Unknown type'}</p>
                            <p className="text-xs text-[#91a39a]">{item.alt}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 uppercase text-[#f8d35c]">{item.kind || 'file'}</td>
                        <td className="px-4 py-3">{formatBytes(item.bytes)}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p>{item.inspection.exceedsLimit ? 'Needs compression' : 'Ready'}</p>
                            {item.errorMessage || item.inspection.message ? (
                              <p className="text-xs text-[#ffd5ca]">
                                {item.errorMessage || item.inspection.message}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleCompressFile(item.id)}
                              disabled={!item.inspection.canCompress || item.state === 'compressing'}
                              className="rounded-xl border border-[#f8d35c]/30 bg-[#201c10] px-3 py-2 text-xs font-medium text-[#f8d35c] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {item.state === 'compressing' ? 'Compressing...' : 'Compress'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFiles((current) => {
                                  const nextItems = current.filter((entry) => entry.id !== item.id)
                                  if (item.previewUrl) {
                                    URL.revokeObjectURL(item.previewUrl)
                                  }
                                  return nextItems
                                })
                              }
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        description="Review your full media list, open any item for detailed editing, and manage cover selection from a single library table."
      >
        {mediaItems.length ? (
          <div className="space-y-4">
            {selectedMediaIds.length ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-sm text-[#d5dfda]">{selectedMediaIds.length} selected</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteSelectedMedia}
                    disabled={!selectedMediaIds.length}
                    className="rounded-xl border border-[#ffb4a2]/30 bg-[#3a1814] px-3 py-2 text-xs font-medium text-[#ffd5ca] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete selected
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMediaIds([])}
                    disabled={!selectedMediaIds.length}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                  <thead className="bg-white/5 text-[#91a39a]">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allSelectedInLibrary}
                          onChange={handleToggleSelectAllMedia}
                          className="h-4 w-4 rounded border-white/20 bg-transparent text-[#f8d35c] focus:ring-[#f8d35c]"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Preview</th>
                      <th className="px-4 py-3 font-medium">File</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {mediaItems.map((item, index) => {
                      const isCover = coverMediaId === item.id
                      const busy =
                        isDeletingMediaId === item.id ||
                        isSavingMediaId === item.id ||
                        isReorderingMediaId === item.id

                      return (
                        <tr key={item.id} className="align-middle text-[#d5dfda]">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedMediaIds.includes(item.id)}
                              onChange={() => handleToggleSelectMedia(item.id)}
                              className="h-4 w-4 rounded border-white/20 bg-transparent text-[#f8d35c] focus:ring-[#f8d35c]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setActiveMediaId(item.id)}
                              className="block h-16 w-24 overflow-hidden rounded-xl border border-white/10 bg-[#0f1513] transition hover:border-[#f8d35c]/30"
                            >
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
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <p className="font-medium text-white">{item.alt || 'Untitled media'}</p>
                              <div className="flex flex-wrap gap-2">
                                {isCover ? (
                                  <span className="rounded-full border border-[#f8d35c]/30 bg-[#3d3314]/50 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#f8d35c]">
                                    Cover
                                  </span>
                                ) : null}
                                <span className="rounded-full border border-white/10 bg-[#0f1513] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                                  {form.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 uppercase text-[#f8d35c]">{item.type}</td>
                          <td className="px-4 py-3">{formatBytes(item.bytes)}</td>
                          <td className="px-4 py-3 text-[#91a39a]">
                            {item.updatedAt ? formatDateTime(item.updatedAt) : 'Just now'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleMoveMedia(item.id, 'up')}
                                disabled={index === 0 || busy}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveMedia(item.id, 'down')}
                                disabled={index === mediaItems.length - 1 || busy}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Down
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveMediaId(item.id)}
                                className="rounded-xl border border-[#f8d35c]/30 bg-[#201c10] px-3 py-2 text-xs font-medium text-[#f8d35c]"
                              >
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 px-5 py-8 text-sm text-[#91a39a]">
            No media has been uploaded to this collection yet.
          </div>
        )}
      </SectionCard>

      {activeMedia ? (
        <MediaManagerModal
          media={activeMedia}
          collectionTitle={form.title}
          isPublished={form.isPublished}
          isCover={coverMediaId === activeMedia.id}
          busy={
            isDeletingMediaId === activeMedia.id ||
            isSavingMediaId === activeMedia.id ||
            isReorderingMediaId === activeMedia.id ||
            isUpdatingCover
          }
          onClose={() => setActiveMediaId('')}
          onChange={(field, value) => updateMediaField(activeMedia.id, field, value)}
          onSave={() => handleSaveMedia(activeMedia.id)}
          onDelete={() => handleDeleteMedia(activeMedia.id)}
          onSetCover={() => handleSetCover(activeMedia.id)}
          onMoveUp={() => handleMoveMedia(activeMedia.id, 'up')}
          onMoveDown={() => handleMoveMedia(activeMedia.id, 'down')}
          saveLabel={isSavingMediaId === activeMedia.id ? 'Saving...' : 'Save changes'}
          deleteLabel={isDeletingMediaId === activeMedia.id ? 'Removing...' : 'Delete media'}
          coverLabel={
            isUpdatingCover
              ? 'Updating cover...'
              : coverMediaId === activeMedia.id
                ? 'Clear cover'
                : 'Set as cover'
          }
        />
      ) : null}
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

function MediaManagerModal({
  media,
  collectionTitle,
  isPublished,
  isCover,
  busy,
  onClose,
  onChange,
  onSave,
  onDelete,
  onSetCover,
  onMoveUp,
  onMoveDown,
  saveLabel,
  deleteLabel,
  coverLabel,
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#030605]/75 px-4 py-8 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#08100d] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#f8d35c]">Media manager</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{media.alt || collectionTitle || 'Gallery media'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[calc(90vh-94px)] gap-0 overflow-y-auto xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <div className="bg-[#0d1512] p-6">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#050908]">
              {media.type === 'image' ? (
                <img
                  src={media.secureUrl || media.url}
                  alt={media.alt || collectionTitle}
                  className="h-full max-h-[65vh] w-full object-contain"
                />
              ) : (
                <video
                  src={media.secureUrl || media.url}
                  controls
                  className="h-full max-h-[65vh] w-full object-contain"
                  preload="metadata"
                />
              )}
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-[#0f1513] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f8d35c]">
                {media.type}
              </span>
              <span className="rounded-full border border-white/10 bg-[#0f1513] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                {isPublished ? 'Published collection' : 'Draft collection'}
              </span>
              {isCover ? (
                <span className="rounded-full border border-[#f8d35c]/30 bg-[#3d3314]/50 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f8d35c]">
                  Current cover
                </span>
              ) : null}
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-[#d5dfda]">Alt text</span>
              <input
                value={media.alt || ''}
                onChange={(event) => onChange('alt', event.target.value)}
                className={inputClassName}
                placeholder="Describe this media"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-[#d5dfda]">Caption</span>
              <textarea
                value={media.caption || ''}
                onChange={(event) => onChange('caption', event.target.value)}
                className={textareaClassName}
                rows={5}
                placeholder="Optional caption for this gallery item"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatPill label="Size" value={formatBytes(media.bytes)} />
              <StatPill label="Format" value={media.format || 'Unknown'} />
              <StatPill
                label="Updated"
                value={media.updatedAt ? formatDateTime(media.updatedAt) : 'Just now'}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSetCover}
                disabled={busy}
                className="inline-flex rounded-2xl border border-[#f8d35c]/30 bg-[#201c10] px-4 py-3 text-sm font-medium text-[#f8d35c] transition hover:bg-[#2d2616] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {coverLabel}
              </button>
              <button
                type="button"
                onClick={onMoveUp}
                disabled={busy}
                className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Move up
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={busy}
                className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Move down
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onSave}
                disabled={busy}
                className="inline-flex rounded-2xl bg-[#f8d35c] px-5 py-3 text-sm font-medium text-[#1b1b12] transition hover:bg-[#ffbf2f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveLabel}
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="inline-flex rounded-2xl border border-[#ffb4a2]/30 bg-[#3a1814] px-4 py-3 text-sm font-medium text-[#ffd5ca] transition hover:bg-[#4c1f1b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function buildSelectedFile(file, { alt = '', caption = '', fallbackTitle = '' } = {}) {
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
