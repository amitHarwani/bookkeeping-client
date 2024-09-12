import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import CustomModal from "@/components/custom/basic/CustomModal";
import DateTimePickerCombined from "@/components/custom/basic/DateTimePickerCombined";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import FilterButton from "@/components/custom/basic/FilterButton";
import Input from "@/components/custom/basic/Input";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import RadioButton from "@/components/custom/basic/RadioButton";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import SaleListItem from "@/components/custom/business/SaleListItem";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { FilterSalesForm } from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import BillingService from "@/services/billing/billing_service";
import {
    GetAllSalesForSalesListResponse
} from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import {
    capitalizeText,
    getApiErrorMessage,
    getDateAfterSubtracting,
} from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import {
    FilterSaleFormValidation
} from "@/utils/schema_validations";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { Formik } from "formik";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

const Sales = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const companyState = useAppSelector((state) => state.company);

    /* purchase type radio button data */
    const purchaseTypeRadioButton = useMemo(
        () => [{ key: "ALL" }, { key: "CASH" }, { key: "CREDIT" }],
        []
    );

    /* Yes no radio button data */
    const yesNoRadioButtonData = useMemo(
        () => [
            { key: "yes", value: true },
            { key: "no", value: false },
        ],
        []
    );

    /* Current state of filters */
    const [filtersState, setFiltersState] = useState<FilterSalesForm>({
        getOnlyOverduePayments: false,
        purchaseType: "ALL",
        filterByDate: false,
    });

    /* Search Input state: To search by invoice number */
    const [searchInput, setSearchInput] = useState<number>();

    /* Search Input error */
    const [searchInputError, setSearchInputError] = useState<string>();

    /* Search Query State, fills data from search input once search button is clicked */
    const [searchQuery, setSearchQuery] = useState<number>();

    /* Visibility of filters modal */
    const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);

    /* Toggle filters modal visibility */
    const toggleFiltersModal = useCallback(() => {
        setIsFiltersModalShown((prev) => !prev);
    }, [isFiltersModalShown]);

    /* Use Infinite query to get sales by filters and search query  */
    const {
        data: salesData,
        error: errorFetchingSales,
        fetchNextPage: fetctNextPageOfSales,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchSales,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.sales,
            selectedCompany?.companyId,
            {
                ...filtersState,
                invoiceNumberSearchQuery: searchQuery,
                select: [
                    "saleId",
                    "partyName",
                    "invoiceNumber",
                    "totalAfterTax",
                    "isNoPartyBill",
                    "updatedAt",
                ],
            },
        ],
        queryFn:
            BillingService.getAllSales<GetAllSalesForSalesListResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: filtersState,
            countryDetails: companyState.country,
            invoiceNumberSearchQuery: Number(searchQuery),
            select: [
                "saleId",
                "partyName",
                "invoiceNumber",
                "totalAfterTax",
                "isNoPartyBill",
                "updatedAt",
            ],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                    query: filtersState,
                    countryDetails: companyState.country,
                    invoiceNumberSearchQuery: Number(searchQuery),
                    select: [
                        "saleId",
                        "partyName",
                        "invoiceNumber",
                        "totalAfterTax",
                        "isNoPartyBill",
                        "updatedAt",
                    ],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Refetch Sales when the screen comes back to focus */
    useRefreshOnFocus(refetchSales);

    /* Search input change handler */
    const searchInputChangeHandler = (text: string) => {
        setSearchInput(Number(text));
    };

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetctNextPageOfSales();
        }
    };

    /* Filter form submit handler */
    const filterFormSubmitHandler = (values: FilterSalesForm) => {
        /* Setting the filters state */
        setFiltersState({
            party: values?.party,
            purchaseType: values?.purchaseType,
            filterByDate: values?.filterByDate,
            fromTransactionDateTime: values?.fromTransactionDateTime,
            toTransactionDateTime: values?.toTransactionDateTime,
            getOnlyOverduePayments: values?.getOnlyOverduePayments,
        });

        /* Hiding the filters modal */
        toggleFiltersModal();
    };

    /* on click of search button */
    const searchHandler = () => {
        /* Removing the error */
        setSearchInputError("");

        /* Empty search */
        if (searchInput === undefined) {
            setSearchQuery(searchInput);
            return;
        }
        /* If searchInput is not a number */
        if (isNaN(searchInput)) {
            setSearchInputError(i18n.t("invoiceNumberShouldBeNumeric"));
            return;
        }

        /* Set search query state to searchInput state */
        setSearchQuery(searchInput);
    };

    /* Once search query or filters state changes */
    useEffect(() => {
        /* If fetching is not in progress */
        if (!isFetching) {
            /* fetch sales  */
            refetchSales();
        }
    }, [filtersState, searchQuery]);

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingSales) {
            return getApiErrorMessage(errorFetchingSales);
        }
    }, [errorFetchingSales]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
            <View style={styles.searchContainer}>
                <Input
                    placeholder={capitalizeText(
                        i18n.t("searchByInvoiceNumber")
                    )}
                    isSearchIconVisible={true}
                    extraInputStyles={{ paddingVertical: 10 }}
                    value={searchInput?.toString() || ""}
                    keyboardType="number-pad"
                    onChangeText={searchInputChangeHandler}
                    extraContainerStyles={{ flex: 1 }}
                    keepLabelSpace={false}
                    errorMessage={searchInputError ? searchInputError : null}
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
                {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_SALE) && (
                    <CustomButton
                        text={i18n.t("addSale")}
                        onPress={() => {
                            router.push(`${AppRoutes.addSale}` as Href);
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
                    data={salesData?.pages
                        .map((salePage) => salePage.data.sales)
                        .flat()}
                    renderItem={({ item }) => (
                        <SaleListItem
                            sale={item}
                            onPress={(sale) =>
                                router.push(
                                    `${AppRoutes.getSale}/${sale.saleId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.saleId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent message={i18n.t("noSalesFound")} />
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
                                getOnlyOverduePayments:
                                    filtersState.getOnlyOverduePayments,
                                filterByDate: filtersState?.filterByDate,
                                fromTransactionDateTime:
                                    filtersState?.fromTransactionDateTime,
                                party: filtersState?.party,
                                purchaseType: filtersState?.purchaseType,
                                toTransactionDateTime:
                                    filtersState?.toTransactionDateTime,
                            }}
                            onSubmit={filterFormSubmitHandler}
                            validationSchema={FilterSaleFormValidation}
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

                                    <View style={styles.partySelectorContainer}>
                                        <InvoicePartySelector
                                            value={values.party}
                                            onChange={(selectedParty) => {
                                                setFieldTouched("party", true);
                                                setFieldValue(
                                                    "party",
                                                    selectedParty
                                                );
                                            }}
                                            extraContainerStyles={{ flex: 1 }}
                                        />
                                        <CustomButton
                                            onPress={() => {
                                                setFieldValue(
                                                    "party",
                                                    undefined
                                                );
                                            }}
                                            text={i18n.t("reset")}
                                            isSecondaryButton
                                            extraContainerStyles={{
                                                flex: 0.3,
                                                paddingHorizontal: 12,
                                                paddingVertical: 10,
                                                height: 54,
                                            }}
                                            extraTextStyles={{ fontSize: 12 }}
                                        />
                                    </View>

                                    <RadioButton
                                        data={purchaseTypeRadioButton}
                                        textKey="key"
                                        label={i18n.t("transactionType")}
                                        onChange={(selectedType) => {
                                            setFieldTouched(
                                                "purchaseType",
                                                true
                                            );
                                            setFieldValue(
                                                "purchaseType",
                                                selectedType.key
                                            );
                                        }}
                                        value={
                                            values.purchaseType === "ALL"
                                                ? purchaseTypeRadioButton[0]
                                                : values.purchaseType === "CASH"
                                                ? purchaseTypeRadioButton[1]
                                                : purchaseTypeRadioButton[2]
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
                                                    "fromTransactionDateTime",
                                                    getDateAfterSubtracting(30)
                                                );
                                                setFieldValue(
                                                    "toTransactionDateTime",
                                                    new Date()
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
                                                setFieldTouched(
                                                    "fromTransactionDateTime"
                                                );
                                                setFieldValue(
                                                    "fromTransactionDateTime",
                                                    dateTime
                                                );
                                            }}
                                            value={
                                                values.fromTransactionDateTime
                                            }
                                            errorMessage={
                                                touched.fromTransactionDateTime &&
                                                errors.fromTransactionDateTime
                                                    ? errors.fromTransactionDateTime
                                                    : null
                                            }
                                        />
                                    )}

                                    {values.filterByDate &&
                                        values.fromTransactionDateTime && (
                                            <DateTimePickerCombined
                                                dateLabel={i18n.t("toDate")}
                                                timeLabel={i18n.t("toTime")}
                                                onChange={(dateTime) => {
                                                    setFieldTouched(
                                                        "toTransactionDateTime"
                                                    );
                                                    setFieldValue(
                                                        "toTransactionDateTime",
                                                        dateTime
                                                    );
                                                }}
                                                value={
                                                    values.toTransactionDateTime
                                                }
                                                errorMessage={
                                                    touched.toTransactionDateTime &&
                                                    errors.toTransactionDateTime
                                                        ? errors.toTransactionDateTime
                                                        : null
                                                }
                                            />
                                        )}

                                    <RadioButton
                                        data={yesNoRadioButtonData}
                                        textKey="key"
                                        label={i18n.t("getOnlyOverduePayments")}
                                        onChange={(selectedType) => {
                                            setFieldTouched(
                                                "purchaseType",
                                                true
                                            );
                                            setFieldValue(
                                                "getOnlyOverduePayments",
                                                selectedType.value
                                            );
                                        }}
                                        value={
                                            values.getOnlyOverduePayments
                                                ? yesNoRadioButtonData[0]
                                                : yesNoRadioButtonData[1]
                                        }
                                    />

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

export default Sales;

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
    partySelectorContainer: {
        flexDirection: "row",
        columnGap: 4,
        alignItems: "flex-end",
    },
});
