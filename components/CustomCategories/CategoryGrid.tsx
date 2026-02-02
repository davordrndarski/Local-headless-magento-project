import { Box } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'

type Category = {
  uid: string
  name?: string | null
  url_path?: string | null
  image?: string | null
}

type CategoryGridProps = {
  categories?: Category[] | null
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null

  return (
    <Box className="category-grid-wrapper">
      {categories.map((category) => (
        <Link
          key={category.uid}
          href={`/${category.url_path}`}
        >
          <Box className="category-grid-item">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name ?? ''}
                fill
              />
            ) : (
              <Box className="category-grid-no-image">
                No Image
              </Box>
            )}
          </Box>
          <Box className="category-grid-name">
            {category.name}
          </Box>
        </Link>
      ))}
    </Box>
  )
}