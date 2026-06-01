import { Helmet } from 'react-helmet-async'
import PropTypes from 'prop-types'

export default function SEO({ title, description, url, image }) {
  const siteName = "Society of Global Cycle (SOGC)"
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const defaultDesc = "Empowering sustainable cycles and environmental awareness globally through campaigns, events, and education."
  const metaDesc = description || defaultDesc
  const canonicalUrl = `https://www.sogc.org${url || ''}` // Replace with actual domain
  const ogImage = image || "https://www.sogc.org/sogc-logo.png"

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  )
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  url: PropTypes.string,
  image: PropTypes.string,
}
