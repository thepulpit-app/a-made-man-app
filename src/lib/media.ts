export function getMediaEmbedUrl(url: string | null) {
  if (!url) return null

  try {
    const parsedUrl = new URL(url)

    if (
      parsedUrl.hostname.includes('player.mediadelivery.net') ||
      parsedUrl.hostname.includes('iframe.mediadelivery.net')
    ) {
      return url
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v')

      if (videoId) return `https://www.youtube.com/embed/${videoId}`

      if (parsedUrl.pathname.includes('/shorts/')) {
        const shortId = parsedUrl.pathname.split('/shorts/')[1]
        return `https://www.youtube.com/embed/${shortId}`
      }
    }

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${videoId}`
    }

    return null
  } catch {
    return null
  }
}