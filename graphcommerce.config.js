const config = {
  magentoEndpoint: 'https://magento.test/graphql',
  canonicalBaseUrl: 'http://localhost:3000',
  storefront: [
    {
      locale: 'en',
      magentoStoreCode: 'default',
      defaultLocale: true,
    },
  ],
}

module.exports = config
