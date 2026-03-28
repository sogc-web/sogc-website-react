const coverageImageModules = import.meta.glob(
  [
    '../assets/SOGC-Media/sogc_media_coverage/*.jpg',
    '../assets/SOGC-Media/sogc_media_coverage/*.jpeg',
    '../assets/SOGC-Media/sogc_media_coverage/*.png',
    '../assets/SOGC-Media/sogc_media_coverage/*.JPG',
    '../assets/SOGC-Media/sogc_media_coverage/*.JPEG',
    '../assets/SOGC-Media/sogc_media_coverage/*.PNG',
  ],
  {
    eager: true,
    import: 'default',
  },
)

export const mediaCoverageImages = Object.entries(coverageImageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([path, src], index) => ({
    id: `${index + 1}-${path.split('/').pop()}`,
    src,
    alt: `Society of Global Cycle media coverage ${index + 1}`,
  }))
