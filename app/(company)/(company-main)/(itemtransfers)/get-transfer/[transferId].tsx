import { i18n } from "@/app/_layout";
import DateTimePickerCombined from "@/components/custom/basic/DateTimePickerCombined";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import TransferItemListItem from "@/components/custom/business/TransferItemListItem";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import InventoryService from "@/services/inventory/inventory_service";
import { useAppSelector } from "@/store";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "@/utils/common_utils";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
    FlatList,
    ScrollView,
    StyleSheet,
    ToastAndroid,
    View,
} from "react-native";

const GetTransfer = () => {
    /* Company State */
    const companyState = useAppSelector((state) => state.company);

    const timezone = useMemo(() => {
        return companyState.country?.timezone;
    }, [companyState]);

    /* Selected company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigation = useNavigation();
    const params = useLocalSearchParams();

    /* Transfer ID from params */
    const transferId = useMemo(() => {
        return Number(params.transferId);
    }, []);

    /* Fetching Transfer Details */
    const {
        isFetching: fetchingTransferDetails,
        data: transferDetails,
        error: errorFetchingTransferDetails,
        refetch: fetchTransferDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getTransfer,
            transferId,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            InventoryService.getTransfer(
                selectedCompany?.companyId as number,
                transferId
            ),
    });

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={i18n.t("transfer")}
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
        });
    }, [navigation, transferDetails]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingTransferDetails ? true : false;
    }, [fetchingTransferDetails]);

    /* Error fetching sale or party details */
    useEffect(() => {
        let message;
        if (errorFetchingTransferDetails) {
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
    }, [errorFetchingTransferDetails]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <View style={styles.container}>
                <DateTimePickerCombined
                    dateLabel={i18n.t("transferDateTime")}
                    onChange={(_) => {}}
                    value={convertUTCStringToTimezonedDate(
                        transferDetails?.data.transfer.createdAt as string,
                        dateTimeFormat24hr,
                        timezone as string
                    )}
                    timeLabel=""
                    isDisabled
                />
                <Input
                    label="from"
                    value={
                        transferDetails?.data.transfer.fromCompanyName as string
                    }
                    isDisabled
                    placeholder=""
                />

                <Input
                    label="to"
                    value={
                        transferDetails?.data.transfer.toCompanyName as string
                    }
                    isDisabled
                    placeholder=""
                />

                <FlatList
                    data={transferDetails?.data.transferItems}
                    renderItem={({ item }) => (
                        <TransferItemListItem item={item} />
                    )}
                    keyExtractor={(item) => item?.itemId?.toString() || ""}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    );
};

export default GetTransfer;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
        rowGap: 16,
    },
});
