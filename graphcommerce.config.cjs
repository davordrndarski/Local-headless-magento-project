const config = {
  magentoEndpoint: 'https://magento.test/graphql',
  magentoVersion: 247,
  canonicalBaseUrl: 'http://localhost:3000',

  productFiltersPro: true,
  productFiltersLayout: 'SIDEBAR',
  
  storefront: [
    {
      locale: 'en',
      magentoStoreCode: 'default',
      defaultLocale: true,
    },
  ],
}

module.exports = config