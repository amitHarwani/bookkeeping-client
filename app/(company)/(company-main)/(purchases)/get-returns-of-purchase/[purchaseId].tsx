import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import PurchaseReturnListItem from "@/components/custom/business/PurchaseReturnListItem";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import billing_service from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import { capitalizeText } from "@/utils/common_utils";
import { useQuery } from "@tanstack/react-query";
import { Href, router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { FlatList, StyleSheet, ToastAndroid, View } from "react-native";

const GetReturnsOfPurchase = () => {
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

    /* Purchase ID */
    const purchaseId = Number(params.purchaseId);

    /* Stack Navigator */
    const navigation = useNavigation();

    /* Fetching Purchase Returns Of A Particular Purchase Invoice */
    const {
        isFetching: fetchingReturns,
        data: returnsData,
        error: errorFetchingReturns,
    } = useQuery({
        queryKey: [ReactQueryKeys.getReturnsOfPurchase, purchaseId, companyId],
        queryFn: () =>
            billing_service.getPurchaseReturnsOfPurchase(purchaseId, companyId),
    });

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={i18n.t("returns")}
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
        });
    }, [navigation]);

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
                        data={returnsData?.data?.purchaseReturns}
                        renderItem={({ item }) => (
                            <PurchaseReturnListItem
                                purchaseReturn={item}
                                onPress={(purchaseReturn) =>
                                    router.push(
                                        `${AppRoutes.getPurchaseReturn}/${purchaseReturn.purchaseReturnId}` as Href
                                    )
                                }
                            />
                        )}
                        keyExtractor={(item) =>
                            item.purchaseReturnId.toString()
                        }
                        ItemSeparatorComponent={() => (
                            <View style={styles.itemSeparator} />
                        )}
                        onEndReachedThreshold={0}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={() => (
                            <ListEmptyComponent
                                message={i18n.t("noPurchaseReturnsFound")}
                            />
                        )}
                    />
                </View>
            )}
        </View>
    );
};

export default GetReturnsOfPurchase;

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
