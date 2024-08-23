import { StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import InventoryService from "@/services/inventory/inventory_service";
import { useAppSelector } from "@/store";
import { i18n } from "@/app/_layout";

const GetItem = () => {
    /* URL Params */
    const params = useLocalSearchParams();

    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );
    
    /* Item ID from params */
    const itemId = useMemo(() => {
        return Number(params.itemId);
    }, [params]);

    /* Navigation */
    const navigation = useNavigation();

    /* Fetching Item data */
    const {
        isFetching: fetchingItem,
        data: itemData,
        error: errorFetchingItem
    } = useQuery({
        queryKey: [ReactQueryKeys.getItem, Number(params.itemId)],
        queryFn: () =>
            InventoryService.getItem(
                Number(params.itemId),
                selectedCompany?.companyId as number
            ),
    });

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={itemData ? itemData.data.item.itemName : i18n.t("item")}
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
        });
    }, [navigation, itemData]);


    /* Show loading spinner when fetching item */
    const showLoadingSpinner = useMemo(() => {
        return fetchingItem ? true : false;
    }, [fetchingItem])

    /* Error fetching item, show a toast message and go back */
    useEffect(() => {
        if(errorFetchingItem){
            ToastAndroid.show(`${i18n.t("errorFetchingItem")}${i18n.t("comma")}${i18n.t("contactSupport")}`, ToastAndroid.LONG);
            router.back();
        }
    }, [errorFetchingItem])
    return (
        <View>
            <Text>GetItem</Text>
        </View>
    );
};

export default GetItem;

const styles = StyleSheet.create({});
