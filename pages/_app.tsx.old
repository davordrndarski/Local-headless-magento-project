import '../styles/custom.css'
import { FramerNextPages } from '@graphcommerce/framer-next-pages'
import { GraphQLProvider } from '@graphcommerce/graphql'
import { GlobalHead } from '@graphcommerce/magento-store'
import { CssAndFramerMotionProvider, PageLoadIndicator } from '@graphcommerce/next-ui'
import { CssBaseline, ThemeProvider } from '@mui/material'
import type { AppProps } from 'next/app'
import { theme } from '../components/theme'
import { I18nProvider } from '../lib/i18n/I18nProvider'
import { setContext } from '@apollo/client/link/context'
import { useMemo } from 'react'

// Intercept all fetch requests and add token
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const [url, options = {}] = args
    
    // Only modify requests to /api/graphql
    if (typeof url === 'string' && url.includes('/api/graphql')) {
      try {
        const apolloCache = localStorage.getItem('apollo-cache-persist')
        if (apolloCache) {
          const cache = JSON.parse(apolloCache)
          const customerTokenObj = cache['CustomerToken:{}']
          
          if (customerTokenObj?.token && customerTokenObj?.valid) {
            console.log('✅ Fetch interceptor: Adding token to request')
            options.headers = {
              ...options.headers,
              authorization: `Bearer ${customerTokenObj.token}`,
            }
          }
        }
      } catch (error) {
        console.error('❌ Fetch interceptor error:', error)
      }
    }
    
    return originalFetch(...args)
  }
}

export default function ThemedApp(props: AppProps) {
  const { router } = props
  const { locale = 'en' } = router

  // Create auth link that adds token to every request
  const authLink = useMemo(() => 
    setContext((_, { headers }) => {
      // Only run in browser
      if (typeof window === 'undefined') {
        return { headers }
      }

      try {
        const apolloCache = localStorage.getItem('apollo-cache-persist')
        if (apolloCache) {
          const cache = JSON.parse(apolloCache)
          const customerTokenObj = cache['CustomerToken:{}']
          
          if (customerTokenObj?.token && customerTokenObj?.valid) {
            console.log('✅ Adding token to request:', customerTokenObj.token.substring(0, 30) + '...')
            return {
              headers: {
                ...headers,
                authorization: `Bearer ${customerTokenObj.token}`,
              },
            }
          }
        }
      } catch (error) {
        console.error('❌ Error reading token:', error)
      }

      return { headers }
    }),
    []
  )

  return (
    <CssAndFramerMotionProvider {...props}>
      <I18nProvider key={locale} locale={locale}>
        <GraphQLProvider {...props} links={[authLink]}>
          <ThemeProvider theme={theme}>
            <GlobalHead />
            <CssBaseline />
            <PageLoadIndicator />
            <FramerNextPages {...props} />
          </ThemeProvider>
        </GraphQLProvider>
      </I18nProvider>
    </CssAndFramerMotionProvider>
  )
}