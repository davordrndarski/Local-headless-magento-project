import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { Container, LayoutHeader, PageMeta, revalidate } from '@graphcommerce/next-ui'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'
import { GetCmsPageDocument } from '../graphql/CmsPage.gql'

type Props = {
  page: any
}

function decodeHtml(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
}

function CustomerServicePage({ page }: Props) {
  if (!page) {
    return <Container>Not found</Container>
  }

  const decodedContent = decodeHtml(page.content)

  return (
    <>
      <PageMeta title={page.title} />
      <LayoutHeader />
      
      <Container sx={{ my: 4 }}>
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: decodedContent }} />
      </Container>
    </>
  )
}

CustomerServicePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default CustomerServicePage

export const getStaticProps: GetStaticProps<LayoutNavigationProps, Props> = async (context) => {
  const client = graphqlSharedClient(context)
  const staticClient = graphqlSsrClient(context)

  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({ query: LayoutDocument })
  const cmsPageQuery = staticClient.query({ 
    query: GetCmsPageDocument, 
    variables: { identifier: 'customer-service' }
  })

  const pageData = (await cmsPageQuery).data?.cmsPage

  return {
    props: {
      page: pageData || null,
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: revalidate(),
  }
}