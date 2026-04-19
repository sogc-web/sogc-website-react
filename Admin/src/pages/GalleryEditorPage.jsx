import { useState } from 'react'
import SectionCard from '../components/SectionCard'

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const textareaClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const defaultFormState = {
  id: '',
  title: '',
  eyebrow: '',
  summary: '',
  folder: '',
  featuredFileName: '',
  expectedMediaPatterns: [
    '*.jpeg',
    '*.jpg',
    '*.JPG',
    '*.JPEG',
    '*.mp4',
    '*.MP4',
    '*.mov',
    '*.MOV',
  ],
}

function GalleryEditorPage({ mode }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(defaultFormState)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Gallery collection"
        title={isEdit ? 'Edit collection' : 'Create collection'}
        description="Set up the collection name, summary, cover image preference, and media folder details for this gallery collection."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Collection identity</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>Collection ID</li>
              <li>Title</li>
              <li>Section label</li>
              <li>Summary</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Media source</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>Folder path</li>
              <li>Linked media lookup</li>
              <li>Image and video support</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Cover selection</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>Featured file name</li>
              <li>Falls back to the first image</li>
              <li>Falls back to the first media item</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Admin note</p>
            <p className="mt-4 text-sm leading-6 text-[#b7c6bf]">
              Keep collection names clear and folder paths consistent so each gallery album stays easy to manage.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Collection editor"
        title={isEdit ? 'Update gallery collection' : 'Create gallery collection'}
        description="Fill in the collection details below to control how this album appears and which media folder it uses."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Collection metadata</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Collection id</span>
                    <input
                      value={form.id}
                      onChange={(event) => updateField('id', event.target.value)}
                      placeholder="char-dwar-2024"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Eyebrow</span>
                    <input
                      value={form.eyebrow}
                      onChange={(event) => updateField('eyebrow', event.target.value)}
                      placeholder="Latest album"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Collection title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateField('title', event.target.value)}
                      placeholder="Char Dwar 2024"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Summary</span>
                    <textarea
                      rows="4"
                      value={form.summary}
                      onChange={(event) => updateField('summary', event.target.value)}
                      placeholder="The newest Char Dwar ride set with portraits, route moments, and group energy."
                      className={textareaClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Media folder</p>
                <div className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Folder path</span>
                    <input
                      value={form.folder}
                      onChange={(event) => updateField('folder', event.target.value)}
                      placeholder="/chardwar 2024/"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Featured file name</span>
                    <input
                      value={form.featuredFileName}
                      onChange={(event) => updateField('featuredFileName', event.target.value)}
                      placeholder="0M3A6480.JPG"
                      className={inputClassName}
                    />
                  </label>
                  <div className="rounded-[24px] border border-dashed border-white/15 bg-[#0f1513] p-4 text-sm leading-6 text-[#9db0a7]">
                    Use the same folder name that contains this collection's media so the correct items are shown on the
                    website.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Accepted media types</p>
                <div className="mt-5 space-y-3">
                  {form.expectedMediaPatterns.map((pattern) => (
                    <div
                      key={pattern}
                      className="rounded-[20px] border border-white/10 bg-[#0f1513] px-4 py-3 text-sm text-[#dbe4df]"
                    >
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Helpful notes</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#e5ede8]">
                  <li>The title, label, and summary are used in the collection card.</li>
                  <li>The folder path decides which media belongs to this collection.</li>
                  <li>The featured file name helps choose the preferred cover image or video.</li>
                  <li>Make sure the folder and file names match your actual media exactly.</li>
                </ul>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Planning note</p>
                <p className="mt-4 text-sm leading-6 text-[#9db0a7]">
                  This form can later expand to support direct uploads and deeper media management without changing the
                  collection basics.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6 max-md:[&>*]:w-full">
            <button type="submit" className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12]">
              {isEdit ? 'Save collection changes' : 'Create collection'}
            </button>
            <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white">
              Check media folder
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

export default GalleryEditorPage
