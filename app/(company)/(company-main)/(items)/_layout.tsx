import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ItemsLayout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="items" />
    </Stack>
  )
}

export default ItemsLayout