import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Purchases = () => {
  return (
    <View style={styles.container}>
    {showLoadingSpinner && <LoadingSpinnerOverlay />}
    {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
    <View style={styles.searchContainer}>
        <Input
            placeholder={capitalizeText(i18n.t("searchByPartyName"))}
            isSearchIconVisible={true}
            extraInputStyles={{ paddingVertical: 10 }}
            value={searchInput}
            onChangeText={searchInputChangeHandler}
            extraContainerStyles={{ flex: 1 }}
            keepLabelSpace={false}
        />
        <CustomButton
            text={i18n.t("search")}
            onPress={searchHandler}
            extraContainerStyles={{ flex: 0.28, paddingVertical: 10 }}
            extraTextStyles={{ fontSize: 12 }}
        />
    </View>
    <View style={styles.actionsContainer}>
        <FilterButton onPress={toggleFiltersModal} />
        {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_PARTY) && (
            <CustomButton
                text={i18n.t("addParty")}
                onPress={() => {
                    router.push(`${AppRoutes.addParty}` as Href);
                }}
                isSecondaryButton={true}
                extraTextStyles={{ fontSize: 12 }}
                extraContainerStyles={{
                    paddingHorizontal: 8,
                    paddingVertical: 10,
                    marginLeft: "auto",
                }}
            />
        )}
    </View>
    <View style={styles.itemListContainer}>
        <FlatList
            data={partiesData?.pages
                .map((partyPage) => partyPage.data.parties)
                .flat()}
            renderItem={({ item }) => (
                <PartyListItem
                    party={item}
                    onPress={(party) =>
                        router.push(
                            `${AppRoutes.getParty}/${party.partyId}` as Href
                        )
                    }
                />
            )}
            keyExtractor={(item) => item.partyId.toString()}
            ItemSeparatorComponent={() => (
                <View style={styles.itemSeparator} />
            )}
            onEndReached={loadMorePagesHandler}
            onEndReachedThreshold={0}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => <ListEmptyComponent message={i18n.t("noPartiesFound")} />}
        />
        {isFetchingNextPage && <ActivityIndicator size="large" />}
    </View>

</View>
  )
}

export default Purchases

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 16,
      paddingTop: 24,
      rowGap: 16,
  },
  searchContainer: {
      flexDirection: "row",
      columnGap: 12,
  },
  actionsContainer: {
      flexDirection: "row",
  },
  itemListContainer: {
      marginTop: 10,
      paddingHorizontal: 8,
      flex: 1,
  },
  itemSeparator: {
      backgroundColor: "#D4D6DD",
      height: 1,
      marginTop: 15,
      marginBottom: 15,
  },
})