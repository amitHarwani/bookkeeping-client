import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import Input from "@/components/custom/basic/Input";
import { i18n } from "@/app/_layout";
import { capitalizeText } from "@/utils/common_utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import InventoryService from "@/services/inventory/inventory_service";
import CustomButton from "@/components/custom/basic/CustomButton";
import { Href, router } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

const Items = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const {
        data: itemsData,
        error: errorFetchingItemsData,
        fetchNextPage: fetctNextPageOfItems,
        hasNextPage,
        isFetching,
        status,
        refetch: refetchItems,
    } = useInfiniteQuery({
        queryKey: [ReactQueryKeys.items],
        queryFn: InventoryService.getAllItems,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                };
            }
            return null;
        },
    });

    useRefreshOnFocus(refetchItems);

    /* Search Input state */
    const [searchInput, setSearchInput] = useState("");

    /* Search input change handler */
    const searchInputChangeHandler = (text: string) => {
        setSearchInput(text);
    };

    return (
        <View style={styles.container}>
            <Input
                placeholder={capitalizeText(i18n.t("searchByItemName"))}
                isSearchIconVisible={true}
                extraInputStyles={{ paddingVertical: 12 }}
                value={searchInput}
                onChangeText={searchInputChangeHandler}
            />
            <View style={styles.actionsContainer}>
                {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPTATE_ITEM) && (
                    <CustomButton
                        text={i18n.t("addItem")}
                        onPress={() => {
                            router.push(`${AppRoutes.addItem}` as Href);
                        }}
                        isSecondaryButton={true}
                        extraTextStyles={{ fontSize: 12 }}
                        extraContainerStyles={{
                            paddingHorizontal: 6,
                            paddingVertical: 10,
                            marginLeft: "auto",
                        }}
                    />
                )}
            </View>
        </View>
    );
};

export default Items;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
        rowGap: 16,
    },
    actionsContainer: {
        flexDirection: "row",
    },
});
