const mediaModules = import.meta.glob(
  [
    '../assets/SOGC-Media/Chardwar 2022/*.jpeg',
    '../assets/SOGC-Media/Chardwar 2022/*.jpg',
    '../assets/SOGC-Media/Chardwar 2022/*.JPG',
    '../assets/SOGC-Media/Chardwar 2022/*.JPEG',
    '../assets/SOGC-Media/chardwar 2023/*.jpeg',
    '../assets/SOGC-Media/chardwar 2023/*.jpg',
    '../assets/SOGC-Media/chardwar 2023/*.JPG',
    '../assets/SOGC-Media/chardwar 2023/*.JPEG',
    '../assets/SOGC-Media/chardwar 2024/*.jpeg',
    '../assets/SOGC-Media/chardwar 2024/*.jpg',
    '../assets/SOGC-Media/chardwar 2024/*.JPG',
    '../assets/SOGC-Media/chardwar 2024/*.JPEG',
    '../assets/SOGC-Media/Cycle day 2023/*.jpeg',
    '../assets/SOGC-Media/Cycle day 2023/*.jpg',
    '../assets/SOGC-Media/Cycle day 2023/*.JPG',
    '../assets/SOGC-Media/Cycle day 2023/*.JPEG',
    '../assets/SOGC-Media/Signature_campaign/*.jpg',
    '../assets/SOGC-Media/Signature_campaign/*.JPG',
    '../assets/SOGC-Media/Signature_campaign/*.jpeg',
    '../assets/SOGC-Media/Signature_campaign/*.JPEG',
    '../assets/SOGC-Media/Voting_awareness/*.jpg',
    '../assets/SOGC-Media/Voting_awareness/*.JPG',
    '../assets/SOGC-Media/Voting_awareness/*.jpeg',
    '../assets/SOGC-Media/Voting_awareness/*.JPEG',
  ],
  {
    eager: true,
    import: 'default',
  },
)

function getFileName(path) {
  const segments = path.split('/')
  return segments[segments.length - 1]
}

const sortedMedia = Object.entries(mediaModules)
  .map(([path, src], index) => ({
    id: `${index + 1}-${getFileName(path)}`,
    src,
    path: path.toLowerCase(),
    fileName: getFileName(path),
  }))
  .sort((left, right) => left.fileName.localeCompare(right.fileName, undefined, { numeric: true, sensitivity: 'base' }))

const campaignFoldersBySlug = {
  'mission-cycle-city-ujjain': ['/cycle day 2023/', '/chardwar 2024/'],
  'char-dwar-cycle-yatra': ['/chardwar 2024/', '/chardwar 2023/'],
  'cyclodaya-dialogues': ['/cycle day 2023/'],
  'ride-for-nation': ['/chardwar 2023/', '/chardwar 2022/'],
  'sunday-cycle-ride': ['/chardwar 2023/', '/cycle day 2023/'],
  'simhastha-2028-cycle-mission': ['/chardwar 2024/', '/cycle day 2023/'],
  'signature-campaign': ['/signature_campaign/'],
  'voting-awareness': ['/voting_awareness/'],
}

export function getCampaignMediaBySlug(slug, limit) {
  const folders = campaignFoldersBySlug[slug] ?? []
  const results = sortedMedia.filter((item) => folders.some((folder) => item.path.includes(folder)))

  const media = results.map((item, index) => ({
    ...item,
    alt: `Campaign gallery image ${index + 1}`,
  }))

  return typeof limit === 'number' ? media.slice(0, limit) : media
}
