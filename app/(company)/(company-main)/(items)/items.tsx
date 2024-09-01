import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Input from "@/components/custom/basic/Input";
import { i18n } from "@/app/_layout";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
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
import { FilterItemsQuery, Item } from "@/services/inventory/inventory_types";
import InventoryListItem from "@/components/custom/business/InventoryListItem";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import FilterButton from "@/components/custom/basic/FilterButton";
import CustomModal from "@/components/custom/basic/CustomModal";
import { FilterItemForm } from "@/constants/types";
import { Formik } from "formik";
import RadioButton from "@/components/custom/basic/RadioButton";
import { commonStyles } from "@/utils/common_styles";

const Items = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* item type radio button data for filtering items */
    const itemTypeRadioButtonData = useMemo(
        () => [{ key: "all" }, { key: "active" }, { key: "inactive" }],
        []
    );

    /* filter by low stock radio button data for filtering items */
    const filterByStockLowRadioButtonData = useMemo(
        () => [
            { key: "yes", value: true },
            { key: "no", value: false },
        ],
        []
    );

    /* Current state of filters */
    const [filtersState, setFiltersState] = useState<FilterItemsQuery>({});

    /* Search Input state */
    const [searchInput, setSearchInput] = useState("");

    /* Search Query State, fills data from search input once search button is clicked */
    const [searchQuery, setSearchQuery] = useState("");

    /* Visibility of filters modal */
    const [isFiltersModalShown, setIsFiltersModalShown] = useState(false);

    /* Toggle filters modal visibility */
    const toggleFiltersModal = useCallback(() => {
        setIsFiltersModalShown((prev) => !prev);
    }, [isFiltersModalShown]);

    /* Use Infinite query to get items by filters and search query  */
    const {
        data: itemsData,
        error: errorFetchingItemsData,
        fetchNextPage: fetctNextPageOfItems,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchItems,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.items,
            selectedCompany?.companyId,
            {
                ...filtersState,
                itemNameSearchQuery: searchQuery,
                select: ["itemName", "unitName", "stock"],
            },
        ],
        queryFn: InventoryService.getAllItems,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: {
                ...filtersState,
                itemNameSearchQuery: searchQuery,
            },
            select: ["itemName", "unitName", "stock"],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                    query: {
                        ...filtersState,
                        itemNameSearchQuery: searchQuery,
                    },
                    select: ["itemName", "unitName", "stock"],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Refetch Items when the screen comes back to focus */
    useRefreshOnFocus(refetchItems);

    /* Search input change handler */
    const searchInputChangeHandler = (text: string) => {
        setSearchInput(text);
    };

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetctNextPageOfItems();
        }
    };

    /* Filter form submit handler */
    const filterFormSubmitHandler = (values: FilterItemForm) => {
        /* New filters state */
        let newFiltersState: FilterItemsQuery = {};

        /* If all is not selected, then filtering by isActive state */
        if (!values.itemType.all && values.itemType.isActive) {
            newFiltersState.isActive = true;
        } else if (!values.itemType.all && !values.itemType.isActive) {
            newFiltersState.isActive = false;
        }

        /* if only the stock low items need to be shown */
        if (values.filterByStockLow) {
            newFiltersState.isStockLow = true;
        }

        /* Setting the filters state */
        setFiltersState(newFiltersState);

        /* Hiding the filters modal */
        toggleFiltersModal();
    };

    /* on click of search button */
    const searchHandler = () => {
        /* Set search query state to searchInput state */
        setSearchQuery(searchInput);
    };

    /* Once search query or filters state changes */
    useEffect(() => {
        /* If fetching is not in progress */
        if (!isFetching) {
            /* fetch items  */
            refetchItems();
        }
    }, [filtersState, searchQuery]);

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingItemsData) {
            return getApiErrorMessage(errorFetchingItemsData);
        }
    }, [errorFetchingItemsData]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
            <View style={styles.searchContainer}>
                <Input
                    placeholder={capitalizeText(i18n.t("searchByItemName"))}
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
                {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPTATE_ITEM) && (
                    <CustomButton
                        text={i18n.t("addItem")}
                        onPress={() => {
                            router.push(`${AppRoutes.addItem}` as Href);
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
                    data={itemsData?.pages
                        .map((item) => item.data.items)
                        .flat()}
                    renderItem={({ item }) => (
                        <InventoryListItem
                            item={item}
                            onPress={(item) =>
                                router.push(
                                    `${AppRoutes.getItem}/${item.itemId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.itemId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
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
                                itemType: {
                                    all:
                                        typeof filtersState?.isActive !=
                                        "boolean"
                                            ? true
                                            : false,
                                    isActive:
                                        typeof filtersState?.isActive ===
                                            "boolean" &&
                                        filtersState?.isActive === true
                                            ? true
                                            : false,
                                },
                                filterByStockLow:
                                    filtersState?.isStockLow === true
                                        ? true
                                        : false,
                            }}
                            onSubmit={filterFormSubmitHandler}
                        >
                            {({ values, setFieldValue, handleSubmit }) => (
                                <View
                                    style={commonStyles.modalEndMenuContainer}
                                >
                                    <Text
                                        style={commonStyles.modalEndMenuHeading}
                                    >
                                        {i18n.t("filter")}
                                    </Text>
                                    <RadioButton
                                        label={i18n.t("selectItemType")}
                                        textKey="key"
                                        data={itemTypeRadioButtonData}
                                        onChange={(value) => {
                                            if (value.key === "all") {
                                                setFieldValue("itemType", {
                                                    all: true,
                                                    isActive: false,
                                                });
                                            } else if (value.key === "active") {
                                                setFieldValue("itemType", {
                                                    all: false,
                                                    isActive: true,
                                                });
                                            } else {
                                                setFieldValue("itemType", {
                                                    all: false,
                                                    isActive: false,
                                                });
                                            }
                                        }}
                                        value={
                                            values.itemType.all
                                                ? itemTypeRadioButtonData[0]
                                                : values.itemType.isActive
                                                ? itemTypeRadioButtonData[1]
                                                : itemTypeRadioButtonData[2]
                                        }
                                    />

                                    <RadioButton
                                        label={i18n.t("filterByLowStockItems")}
                                        textKey="key"
                                        data={filterByStockLowRadioButtonData}
                                        onChange={(selectedItem) => {
                                            setFieldValue(
                                                "filterByStockLow",
                                                selectedItem.value
                                            );
                                        }}
                                        value={
                                            values.filterByStockLow
                                                ? filterByStockLowRadioButtonData[0]
                                                : filterByStockLowRadioButtonData[1]
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

export default Items;

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
});
