import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import CustomModal from "@/components/custom/basic/CustomModal";
import DateTimePickerCombined from "@/components/custom/basic/DateTimePickerCombined";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import FilterButton from "@/components/custom/basic/FilterButton";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import RadioButton from "@/components/custom/basic/RadioButton";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import {
    FilterTransfersForm,
    TransferType
} from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import InventoryService from "@/services/inventory/inventory_service";
import { GetAllTransfersForTransfersListResponse } from "@/services/inventory/inventory_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import {
    getApiErrorMessage,
    getDateAfterSubtracting
} from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import {
    FilterTransfersFormValidation
} from "@/utils/schema_validations";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { Formik } from "formik";

import TransferListItem from "@/components/custom/business/TransferListItem";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

const ItemTransfers = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Company State */
    const companyState = useAppSelector((state) => state.company);

    /* Transfer type radio button data */
    const transferTypeRadioButtonData = useMemo(
        () => [
            { key: TransferType.all },
            { key: TransferType.received },
            { key: TransferType.sent },
        ],
        []
    );

    /* Yes No Radio Button Data for filter by date radio button */
    const yesNoRadioButtonData = useMemo(() => {
        return [
            { key: "yes", value: true },
            { key: "no", value: false },
        ];
    }, []);

    /* Current state of filters */
    const [filtersState, setFiltersState] = useState<FilterTransfersForm>({
        filterByDate: false,
        type: TransferType.all,
    });

    /* Visibility of filters modal */
    const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);

    /* Toggle filters modal visibility */
    const toggleFiltersModal = useCallback(() => {
        setIsFiltersModalShown((prev) => !prev);
    }, [isFiltersModalShown]);

    /* Use Infinite query to get transfers by filters */
    const {
        data: transfersData,
        error: errorFetchingTransfers,
        fetchNextPage: fetchNextPageOfTransfers,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchTransfers,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.itemTransfers,
            companyId,
            {
                ...filtersState,
                select: [
                    "transferId",
                    "createdAt",
                    "fromCompanyId",
                    "toCompanyId",
                    "fromCompanyName",
                    "toCompanyName",
                ],
            },
        ],
        queryFn:
            InventoryService.getAllTransfers<GetAllTransfersForTransfersListResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: filtersState,
            countryDetails: companyState.country,
            select: [
                "transferId",
                "createdAt",
                "fromCompanyId",
                "toCompanyId",
                "fromCompanyName",
                "toCompanyName",
            ],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage?.data?.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                    query: filtersState,
                    countryDetails: companyState.country,
                    select: [
                        "transferId",
                        "createdAt",
                        "fromCompanyId",
                        "toCompanyId",
                        "fromCompanyName",
                        "toCompanyName",
                    ],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Refetch Transfers when the screen comes back to focus */
    useRefreshOnFocus(refetchTransfers);

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetchNextPageOfTransfers();
        }
    };

    /* Filter form submit handler */
    const filterFormSubmitHandler = (values: FilterTransfersForm) => {
        /* Setting the filters state */
        setFiltersState({
            type: values?.type,
            filterByDate: values?.filterByDate,
            fromDate: values?.fromDate,
            toDate: values?.toDate,
        });

        /* Hiding the filters modal */
        toggleFiltersModal();
    };

    /* Once search query or filters state changes */
    useEffect(() => {
        /* If fetching is not in progress */
        if (!isFetching) {
            /* fetch transfers  */
            refetchTransfers();
        }
    }, [filtersState]);

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingTransfers) {
            return getApiErrorMessage(errorFetchingTransfers);
        }
    }, [errorFetchingTransfers]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}

            <View style={styles.actionsContainer}>
                <FilterButton onPress={toggleFiltersModal} />
                {isFeatureAccessible(PLATFORM_FEATURES.ADD_TRANSFER) && (
                    <CustomButton
                        text={i18n.t("addTransfer")}
                        onPress={() => {
                            router.push(`${AppRoutes.addTransfer}` as Href);
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
                    data={transfersData?.pages
                        .map((transferPage) => transferPage.data.transfers)
                        .flat()}
                    renderItem={({ item }) => (
                        <TransferListItem
                            transfer={item}
                            onPress={(transfer) =>
                                router.push(
                                    `${AppRoutes.getTransfer}/${transfer.transferId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.transferId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent
                            message={i18n.t("noTransfersFound")}
                        />
                    )}
                />
                {isFetchingNextPage && <ActivityIndicator size="large" />}
            </View>

            <CustomModal
                visible={isFiltersModalShown}
                onRequestClose={toggleFiltersModal}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <View>
                        <Formik
                            initialValues={{
                                type: filtersState?.type,
                                fromDate: filtersState?.fromDate,
                                toDate: filtersState?.toDate,
                                filterByDate: filtersState?.filterByDate,
                            }}
                            onSubmit={filterFormSubmitHandler}
                            validationSchema={FilterTransfersFormValidation}
                        >
                            {({
                                values,
                                setFieldValue,
                                setFieldTouched,
                                handleSubmit,
                                touched,
                                errors,
                                resetForm,
                            }) => (
                                <View
                                    style={commonStyles.modalEndMenuContainer}
                                >
                                    <Text
                                        style={commonStyles.modalEndMenuHeading}
                                    >
                                        {i18n.t("filter")}
                                    </Text>

                                    <RadioButton
                                        data={transferTypeRadioButtonData}
                                        textKey="key"
                                        label={i18n.t("transferType")}
                                        onChange={(selectedType) => {
                                            setFieldTouched("type", true);
                                            setFieldValue(
                                                "type",
                                                selectedType.key
                                            );
                                        }}
                                        value={
                                            values.type === "ALL"
                                                ? transferTypeRadioButtonData[0]
                                                : values.type === "RECEIVED"
                                                ? transferTypeRadioButtonData[1]
                                                : transferTypeRadioButtonData[2]
                                        }
                                    />

                                    <RadioButton
                                        data={yesNoRadioButtonData}
                                        textKey="key"
                                        label={`${i18n.t(
                                            "filterByDate"
                                        )} ${i18n.t("qm")}`}
                                        onChange={(answer) => {
                                            setFieldValue(
                                                "filterByDate",
                                                answer.value
                                            );
                                            if (answer.value) {
                                                setFieldValue(
                                                    "fromDate",
                                                    getDateAfterSubtracting(30)
                                                );
                                                setFieldValue(
                                                    "toDate",
                                                    new Date()
                                                );
                                            } else {
                                                setFieldValue(
                                                    "fromDate",
                                                    undefined
                                                );
                                                setFieldValue(
                                                    "toDate",
                                                    undefined
                                                );
                                            }
                                        }}
                                        value={
                                            values.filterByDate
                                                ? yesNoRadioButtonData[0]
                                                : yesNoRadioButtonData[1]
                                        }
                                    />

                                    {values.filterByDate && (
                                        <DateTimePickerCombined
                                            dateLabel={i18n.t("fromDate")}
                                            timeLabel={i18n.t("fromTime")}
                                            onChange={(dateTime) => {
                                                setFieldTouched("fromDate");
                                                setFieldValue(
                                                    "fromDate",
                                                    dateTime
                                                );
                                            }}
                                            value={values.fromDate}
                                            errorMessage={
                                                touched.fromDate &&
                                                errors.fromDate
                                                    ? errors.fromDate
                                                    : null
                                            }
                                        />
                                    )}

                                    {values.filterByDate && values.fromDate && (
                                        <DateTimePickerCombined
                                            dateLabel={i18n.t("toDate")}
                                            timeLabel={i18n.t("toTime")}
                                            onChange={(dateTime) => {
                                                setFieldTouched("toDate");
                                                setFieldValue(
                                                    "toDate",
                                                    dateTime
                                                );
                                            }}
                                            value={values.toDate}
                                            errorMessage={
                                                touched.toDate && errors.toDate
                                                    ? errors.toDate
                                                    : null
                                            }
                                        />
                                    )}

                                    <View
                                        style={
                                            commonStyles.modalEndActionsContainer
                                        }
                                    >
                                        <CustomButton
                                            text={i18n.t("apply")}
                                            onPress={handleSubmit}
                                            extraContainerStyles={{ flex: 1 }}
                                        />
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                }
            />
        </View>
    );
};

export default ItemTransfers;

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
