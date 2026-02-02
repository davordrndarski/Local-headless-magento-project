import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material'
import Link from 'next/link'
import { iconChevronDown, IconSvg } from '@graphcommerce/next-ui'

type Category = {
  uid: string
  name?: string | null
  url_path?: string | null
  children?: Category[] | null
}

type CustomCategorySidebarProps = {
  category: Category
}

export function CustomCategorySidebar({ category }: CustomCategorySidebarProps) {
  if (!category.children || category.children.length === 0) return null

  return (
    <Accordion 
      defaultExpanded 
      disableGutters
      elevation={0}
      sx={(theme) => ({
        '&:before': { display: 'none' },
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'transparent',
      })}
    >
      <AccordionSummary
        expandIcon={<IconSvg src={iconChevronDown} size="medium" />}
        sx={(theme) => ({
          minHeight: 48,
          px: 0,
          '& .MuiAccordionSummary-content': {
            my: 1,
          },
        })}
      >
        <Typography 
          variant="subtitle1" 
          sx={(theme) => ({ 
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
          })}
        >
          {category.name}
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {category.children.map((child) => (
            <Link
              key={child.uid}
              href={`/${child.url_path}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '8px 0',
                fontSize: '1rem',
              }}
            >
              {child.name}
            </Link>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}