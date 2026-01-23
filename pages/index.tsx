import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import type { CmsPageFragment } from '@graphcommerce/magento-cms'
import { CmsPageContent, CmsPageDocument } from '@graphcommerce/magento-cms'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { ProductListDocument } from '@graphcommerce/magento-product' // pozivanje proizvoda
import { breadcrumbs } from '@graphcommerce/next-config/config'
import { Container, isTypename, LayoutHeader, PageMeta, revalidate } from '@graphcommerce/next-ui'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { t } from '@lingui/core/macro'
import { Typography } from '@mui/material'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation, productListRenderer, ProductListItems } from '../components'  // pozivanje proizvoda
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { GetCmsBlockDocument } from '../graphql/CmsBlock.gql'

// Definišemo tip za CMS blok
type CmsBlockType = {
  identifier: string
  title: string
  content: string
}

// Props kombinuju CMS Page, Custom blokove I PROIZVODE
export type CmsPageProps = { 
  cmsPage: CmsPageFragment | null
  testBlok?: CmsBlockType | null
  testBlokDva?: CmsBlockType | null
  products?: any
}

type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, CmsPageProps>

function HomePage(props: CmsPageProps) {
  const { cmsPage, testBlok, testBlokDva, products } = props

  if (!cmsPage) return <Container>Configure cmsPage home</Container>

  return (
    <>
      {/* SEO Meta tagovi */}
      <PageMeta
        title={cmsPage.meta_title || cmsPage.title || t`Home`}
        metaDescription={cmsPage.meta_description || undefined}
      />
      
      {/* Header */}
      <LayoutHeader floatingMd hideMd={breadcrumbs} floatingSm />

      {/* PRVI CUSTOM BLOK - test_blok */}
      {testBlok?.content && (
        <Container 
          sx={{ 
            my: 4,
            '& .pagebuilder-mobile-only': {
              display: { xs: 'block', md: 'none' }
            },
            '& .pagebuilder-mobile-hidden': {
              display: { xs: 'none', md: 'block' }
            }
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: testBlok.content }} />
        </Container>
      )}

      {products?.items && products.items.length > 0 && (
        <>
          <Typography variant="h3">Bags Collection</Typography>
          <ProductListItems
            items={products.items}
            renderers={productListRenderer}
            loadingEager={6}
            title="Bags Collection"
          />
        </>
      )}

      {/* GLAVNI CMS PAGE SADRŽAJ - kategorije proizvoda, itd. */}
      <CmsPageContent cmsPage={cmsPage} productListRenderer={productListRenderer} />

      {/* DRUGI CUSTOM BLOK - test_blok_dva */}
      {testBlokDva?.content && (
        <Container 
          sx={{ 
            my: 4,
            '& .pagebuilder-mobile-only': {
              display: { xs: 'block', md: 'none' }
            },
            '& .pagebuilder-mobile-hidden': {
              display: { xs: 'none', md: 'block' }
            }
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: testBlokDva.content }} />
        </Container>
      )}
    </>
  )
}

HomePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default HomePage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const staticClient = graphqlSsrClient(context)

  const confData = (await conf).data
  const url = confData?.storeConfig?.cms_home_page ?? 'home'
  
  // Povlači CMS Page (home page sa kategorijama)
  const cmsPageQuery = staticClient.query({ query: CmsPageDocument, variables: { url } })
  
  // Povlači Layout (menu, footer)
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })
  
  // Povlači custom CMS blokove
  const cmsBlockQuery = staticClient.query({
    query: GetCmsBlockDocument,
    variables: { 
      identifiers: ['test_blok', 'test_blok_dva']
    }
  })

  // Povlači proizvode iz Bags kategorije
  const productsQuery = staticClient.query({
    query: ProductListDocument,
    variables: {
      pageSize: 14,
      currentPage: 1,
      filters: {
        category_url_path: { eq: "gear/bags" }
      }
    }
  })

  // Izvlačimo podatke
  const cmsPage = (await cmsPageQuery).data?.route
  const cmsBlockData = (await cmsBlockQuery).data
  const blocks = cmsBlockData?.cmsBlocks?.items || []
  const productsData = (await productsQuery).data
  
  // Pronalazimo blokove po identifieru
  const testBlok = blocks.find((b: any) => b.identifier === 'test_blok')
  const testBlokDva = blocks.find((b: any) => b.identifier === 'test_blok_dva')

  return {
    props: {
      cmsPage: cmsPage && isTypename(cmsPage, ['CmsPage']) ? cmsPage : null,
      testBlok: testBlok || null,
      testBlokDva: testBlokDva || null,
      products: productsData?.products || null,
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: revalidate(),
  }
}