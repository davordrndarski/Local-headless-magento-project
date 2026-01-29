import { useState } from 'react'
import { Box, Tabs, Tab } from '@mui/material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

interface ProductTabsProps {
  children: [React.ReactNode, React.ReactNode, React.ReactNode]
  labels?: [string, string, string]
}

export function ProductTabs({ 
  children, 
  labels = ['Description', 'Specifications', 'Reviews'] 
}: ProductTabsProps) {
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Tabs 
        value={value} 
        onChange={handleChange}
        aria-label="product information tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={labels[0]} id="product-tab-0" aria-controls="product-tabpanel-0" />
        <Tab label={labels[1]} id="product-tab-1" aria-controls="product-tabpanel-1" />
        <Tab label={labels[2]} id="product-tab-2" aria-controls="product-tabpanel-2" />
      </Tabs>

      <TabPanel value={value} index={0}>
        {children[0]}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {children[1]}
      </TabPanel>

      <TabPanel value={value} index={2}>
        {children[2]}
      </TabPanel>
    </Box>
  )
}
