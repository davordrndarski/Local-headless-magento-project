import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import type { CmsPageFragment } from '@graphcommerce/magento-cms'
import { CmsPageContent, CmsPageDocument } from '@graphcommerce/magento-cms'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { ProductListDocument } from '@graphcommerce/magento-product'
import { breadcrumbs } from '@graphcommerce/next-config/config'
import { Container, isTypename, LayoutHeader, PageMeta, revalidate } from '@graphcommerce/next-ui'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { t } from '@lingui/core/macro'
import { Typography, Box } from '@mui/material'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation, productListRenderer, ProductListItems } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { GetCmsBlockDocument } from '../graphql/CmsBlock.gql'

type CmsBlockType = {
  identifier: string
  title: string
  content: string
}

export type CmsPageProps = { 
  cmsPage: CmsPageFragment | null
  testBlok?: CmsBlockType | null
  testBlokDva?: CmsBlockType | null
  products?: any
}

type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, CmsPageProps>

function HomePage(props: CmsPageProps) {
  const { cmsPage, testBlok, testBlokDva, products } = props

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    swipe: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } }
    ]
  }

  if (!cmsPage) return <Container>Configure cmsPage home</Container>

  return (
    <>
      <PageMeta
        title={cmsPage.meta_title || cmsPage.title || t`Home`}
        metaDescription={cmsPage.meta_description || undefined}
      />
      
      <LayoutHeader floatingMd hideMd={breadcrumbs} floatingSm />

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

      {/* BAGS PROIZVODI - SLIDER */}
      {products?.items && products.items.length > 0 && (
        <Container sx={{ my: 6 }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4, textAlign: 'center' }}>
            Bags Collection
          </Typography>
          
          <Box sx={{ 
            '& .slick-slide > div': { 
              px: 1,
              outline: 'none'
            },
            '& .slick-dots': { bottom: -40 },
            '& .slick-arrow:before': { color: 'primary.main', fontSize: 40 }
          }}>
            <Slider {...sliderSettings}>
              {products.items.map((product: any) => (
                <div key={product.uid}>
                  <ProductListItems
                    items={[product]}
                    renderers={productListRenderer}
                    loadingEager={1}
                    title=""
                  />
                </div>
              ))}
            </Slider>
          </Box>
        </Container>
      )}

      <CmsPageContent cmsPage={cmsPage} productListRenderer={productListRenderer} />

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
  
  const cmsPageQuery = staticClient.query({ query: CmsPageDocument, variables: { url } })
  const layout = staticClient.query({ query: LayoutDocument, fetchPolicy: cacheFirst(staticClient) })
  const cmsBlockQuery = staticClient.query({
    query: GetCmsBlockDocument,
    variables: { identifiers: ['test_blok', 'test_blok_dva'] }
  })
  const productsQuery = staticClient.query({
    query: ProductListDocument,
    variables: {
      pageSize: 14,
      currentPage: 1,
      filters: { category_url_path: { eq: "gear/bags" } }
    }
  })

  const cmsPage = (await cmsPageQuery).data?.route
  const cmsBlockData = (await cmsBlockQuery).data
  const blocks = cmsBlockData?.cmsBlocks?.items || []
  const productsData = (await productsQuery).data
  
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