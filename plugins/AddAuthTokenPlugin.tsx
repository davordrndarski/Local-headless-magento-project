import type { PluginConfig, PluginProps } from '@graphcommerce/next-config'
import type { GraphQLProviderProps } from '@graphcommerce/graphql'
import { ApolloLink } from '@apollo/client'

export const config: PluginConfig = {
  type: 'component',
  module: '@graphcommerce/graphql',
}

/**
 * Custom Apollo Link that automatically adds customer token to Authorization header
 */
const authLink = new ApolloLink((operation, forward) => {
  console.log('🔐 Auth Link activated for operation:', operation.operationName)
  
  // Only run in browser (not SSR)
  if (typeof window === 'undefined') {
    console.log('⚠️ Running on server, skipping auth')
    return forward(operation)
  }

  try {
    // Get token from Local Storage (apollo-cache-persist)
    const apolloCache = localStorage.getItem('apollo-cache-persist')
    console.log('📦 Apollo cache exists:', !!apolloCache)
    
    if (apolloCache) {
      const cache = JSON.parse(apolloCache)
      
      // Try direct access to CustomerToken
      const customerTokenObj = cache['CustomerToken:{}']
      console.log('🎫 CustomerToken object:', customerTokenObj)
      
      if (customerTokenObj && customerTokenObj.token) {
        const token = customerTokenObj.token
        console.log('✅ Token found:', token.substring(0, 30) + '...')
        
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${token}`,
          },
        }))
        
        console.log('✅ Authorization header added!')
      } else {
        console.log('❌ No token found in CustomerToken object')
      }
    } else {
      console.log('❌ No apollo-cache-persist in localStorage')
    }
  } catch (error) {
    console.error('❌ Error reading customer token:', error)
  }

  return forward(operation)
})

/**
 * Plugin to inject custom authentication link into Apollo Client
 */
export function GraphQLProvider(props: PluginProps<GraphQLProviderProps>) {
  console.log('🔌 GraphQLProvider plugin activated!')
  console.log('📋 Existing links:', props.links?.length || 0)
  
  const { Prev, links = [], ...rest } = props
  
  // Add authLink to the beginning of the links array
  const enhancedLinks = [authLink, ...links]
  
  console.log('📋 Enhanced links count:', enhancedLinks.length)
  
  return <Prev {...rest} links={enhancedLinks} />
}
