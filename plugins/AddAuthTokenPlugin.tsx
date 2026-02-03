import type { PluginConfig, PluginProps } from '@graphcommerce/next-config'
import type { GraphQLProviderProps } from '@graphcommerce/graphql'
import { ApolloLink } from '@apollo/client'

export const config: PluginConfig = {
  type: 'component',
  module: '@graphcommerce/graphql',
}

// Lista GraphQL operacija koje NE treba da imaju auth token
const PUBLIC_OPERATIONS = [
  'generateCustomerToken',
  'createCustomer',
  'createCustomerV2',
  'requestPasswordResetEmail',
  'resetPassword',
]

const authLink = new ApolloLink((operation, forward) => {
  if (typeof window === 'undefined') {
    return forward(operation)
  }

  // Proveri da li je ovo public operacija
  const operationName = operation.operationName
  const isPublicOperation = operationName ? PUBLIC_OPERATIONS.includes(operationName) : false

  // Ako je public operacija, ne dodavaj token
  if (isPublicOperation) {
    return forward(operation)
  }

  try {
    const apolloCache = localStorage.getItem('apollo-cache-persist')
    
    if (apolloCache) {
      const cache = JSON.parse(apolloCache)
      const customerTokenObj = cache['CustomerToken:{}']
      
      if (customerTokenObj && customerTokenObj.token) {
        const token = customerTokenObj.token
        
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${token}`,
          },
        }))
      }
    }
  } catch (error) {
    console.error('Error reading customer token:', error)
  }

  return forward(operation)
})

export function GraphQLProvider(props: PluginProps<GraphQLProviderProps>) {
  const { Prev, links = [], ...rest } = props
  const enhancedLinks = [authLink, ...links]
  
  return <Prev {...rest} links={enhancedLinks} />
}