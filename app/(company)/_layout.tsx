import { Stack } from 'expo-router'
import React from 'react'

const CompanyLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="view-all-companies" />
      <Stack.Screen name="add-company" />
      <Stack.Screen name='add-branch' />
      <Stack.Screen name="(company-config)" />
      <Stack.Screen name="(company-main)" />
    </Stack>
  )
}

export default CompanyLayout