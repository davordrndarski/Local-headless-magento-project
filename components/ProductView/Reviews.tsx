import { useQuery } from '@graphcommerce/graphql'
import type { ProductReviewsProps } from '@graphcommerce/magento-review'
import { ProductReviews } from '@graphcommerce/magento-review'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { Row } from '@graphcommerce/next-ui'
import { Box, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { gql } from '@apollo/client'

const GET_ALL_REVIEWS = gql`
  query ProductReviewsAll($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        uid
        sku
        review_count
        reviews(pageSize: 100, currentPage: 1) {
          items {
            average_rating
            ratings_breakdown {
              name
              value
            }
            summary
            text
            nickname
            created_at
          }
          page_info {
            current_page
            page_size
            total_pages
          }
        }
      }
    }
  }
`

// Dodaj tip za query rezultat
interface ProductReviewsData {
  products: {
    items: Array<{
      uid: string
      sku: string
      review_count: number
      reviews: {
        items: any[]
        page_info: {
          current_page: number
          page_size: number
          total_pages: number
        }
      }
    }>
  }
}

type ReviewsProps = ProductReviewsProps & { title: React.ReactNode }

export function Reviews(props: ReviewsProps) {
  const { title, url_key, review_count, sku } = props
  const [mounted, setMounted] = useState(false)

  const { data: storeConfig, loading: configLoading } = useQuery(StoreConfigDocument)
  
  // Povuci SVE recenzije sa tipom
  const { data: reviewsData, loading: reviewsLoading } = useQuery<ProductReviewsData>(
    GET_ALL_REVIEWS,
    {
      variables: { sku },
      skip: !sku,
    }
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (configLoading || reviewsLoading) return null
  if (!storeConfig?.storeConfig?.product_reviews_enabled) return null
  if (!mounted) return null

  const allReviews = reviewsData?.products?.items?.[0]?.reviews

  // Ako nema recenzija, kreiraj prazan reviews objekat
  // Tako ProductReviews komponenta može da prikaže "Write a review" dugme
  const reviewsToShow = allReviews?.items?.length 
    ? allReviews 
    : {
        items: [],
        page_info: {
          current_page: 1,
          page_size: 100,
          total_pages: 0
        }
      }

  return (
    <Row maxWidth='md' id='reviews'>
      <Box
        sx={(theme) => ({
          position: 'relative',
          '&:focus': { outline: 'none' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacings.sm,
          marginBottom: theme.spacings.xxs,
          paddingBottom: theme.spacings.xxs,
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        })}
      >
        <Typography variant='overline' color='textSecondary' component='h2'>
          {title} {review_count ? `(${review_count})` : ''}
        </Typography>
      </Box>

      <Box
        sx={{
          '& .MuiPagination-root': {
            display: 'none !important',
          },
          '& nav[aria-label*="pagination"]': {
            display: 'none !important',
          },
        }}
      >
        <ProductReviews
          reviews={reviewsToShow}
          url_key={url_key ?? ''}
          sku={sku}
          review_count={review_count ?? 0}
        />
      </Box>
    </Row>
  )
}
