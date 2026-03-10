import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path = '/' }) => {
  const baseUrl = 'https://www.erlb.in';
  const canonical = `${baseUrl}${path}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ERLB - Eat Right Live Bright',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: []
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};

export default SEO;
