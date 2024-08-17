import { View, Text } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'

const CompanyLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="view-all-companies" />
      <Stack.Screen name="(company-config)" />
      <Stack.Screen name="add-company" />
    </Stack>
  )
}

export default CompanyLayout