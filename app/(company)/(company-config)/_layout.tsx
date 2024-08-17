import { View, Text } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'

const CompanySettingsLayout = () => {
  return (
    <Tabs screenOptions={{headerShown: false}}>
      <Tabs.Screen name="company-settings/[companyId]" />
    </Tabs>
  )
}

export default CompanySettingsLayout