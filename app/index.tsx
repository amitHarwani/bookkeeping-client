import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { fonts } from '@/constants/fonts'
import { getValueFromSecureStore } from '@/utils/securestore'
import { SecureStoreKeys } from '@/constants/securestorekeys'
import { Redirect, router } from 'expo-router'
import { AppRoutes } from '@/constants/routes'


const App = () => {

  const isUserLoggedIn = useMemo(() => {
    if(getValueFromSecureStore(SecureStoreKeys.accessToken)){
      return true;
    }
    else{
      return false;
    }
  }, [])

  if(isUserLoggedIn){
    return <Redirect href={AppRoutes.dashboard} />
  }
  return <Redirect href={AppRoutes.login} />
  
}

const styles = StyleSheet.create({
    textStyle: {
        color: "#000000",
        fontSize: 24,
        fontFamily: fonts.Inter_Black
    }
})

export default App