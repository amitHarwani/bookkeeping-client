import { FlatList, StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Href, router, useLocalSearchParams, useNavigation } from "expo-router";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useAppSelector } from "@/store";
import billing_service from "@/services/billing/billing_service";
import { i18n } from "@/app/_layout";
import { capitalizeText } from "@/utils/common_utils";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import SaleReturnListItem from "@/components/custom/business/SaleReturnListItem";
import { AppRoutes } from "@/constants/routes";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";

const GetSaleReturn = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Params */
    const params = useLocalSearchParams();

    /* Sale ID */
    const saleId = Number(params.saleId);

    /* Stack Navigator */
    const navigation = useNavigation();

    /* Fetching Sale Returns Of A Particular Sale Invoice */
    const {
        isFetching: fetchingReturns,
        data: returnsData,
        error: errorFetchingReturns,
    } = useQuery({
        queryKey: [ReactQueryKeys.getReturnsOfSale, saleId, companyId],
        queryFn: () => billing_service.getSaleReturnsOfSale(saleId, companyId),
    });

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        returnsData && returnsData?.data?.saleReturns?.length
                            ? `${
                                  returnsData?.data?.saleReturns?.[0]
                                      ?.invoiceNumber
                              } - ${i18n.t("returns")}`
                            : i18n.t("returns")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
        });
    }, [navigation, returnsData]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingReturns ? true : false;
    }, [fetchingReturns]);

    /* Error fetching returns: Show toast message and go back */
    useEffect(() => {
        let message;
        if (errorFetchingReturns) {
            message = capitalizeText(
                `${i18n.t("errorFetchingDetails")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (message) {
            ToastAndroid.show(message, ToastAndroid.LONG);
            router.back();
        }
    }, [errorFetchingReturns]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            {returnsData && (
                <View style={styles.itemListContainer}>
                    <FlatList
                        data={returnsData?.data?.saleReturns}
                        renderItem={({ item }) => (
                            <SaleReturnListItem
                                saleReturn={item}
                                onPress={(saleReturn) =>
                                    router.push(
                                        `${AppRoutes.getSaleReturn}/${saleReturn.saleReturnId}` as Href
                                    )
                                }
                            />
                        )}
                        keyExtractor={(item) => item.saleReturnId.toString()}
                        ItemSeparatorComponent={() => (
                            <View style={styles.itemSeparator} />
                        )}
                        onEndReachedThreshold={0}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={() => (
                            <ListEmptyComponent
                                message={i18n.t("noSaleReturnsFound")}
                            />
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default GetSaleReturn;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
        rowGap: 16,
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
});
