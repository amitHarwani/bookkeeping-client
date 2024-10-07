import React, { useEffect, useState } from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import Dropdown from "../basic/Dropdown";
import { i18n } from "@/app/_layout";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useAppSelector } from "@/store";
import InventoryService from "@/services/inventory/inventory_service";
import { router } from "expo-router";
import { capitalizeText, debounce } from "@/utils/common_utils";
import { GetAllItemsForInvoiceItemSelectorResponse, Item } from "@/services/inventory/inventory_types";
import { GenericObject, ItemTypeInInvoiceItem } from "@/constants/types";

interface InvoiceItemSelectorProps {
    value?: ItemTypeInInvoiceItem;
    onChange(item: ItemTypeInInvoiceItem): void;
    errorMessage?: string | null;
}
const InvoiceItemSelector = ({
    value,
    onChange,
    errorMessage,
}: InvoiceItemSelectorProps) => {
    /* Selected Company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Selected Item */
    const [selectedItem, setSelectedItem] = useState<ItemTypeInInvoiceItem>();

    /* Item name searched state */
    const [itemNameSearched, setItemNameSearched] = useState("");

    /* Fetching items, according to searched name */
    const {
        data: itemsData,
        error: errorFetchingItems,
        fetchNextPage: fetchNextPageOfItems,
        isFetchingNextPage,
        refetch: refetchItems,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.items,
            selectedCompany?.companyId,
            {
                isActive: true,
                itemNameSearchQuery: itemNameSearched,
                select: ["itemId", "itemName", "unitId", "unitName"],
            },
        ],
        queryFn: InventoryService.getAllItems<GetAllItemsForInvoiceItemSelectorResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
            query: { isActive: true, itemNameSearchQuery: itemNameSearched },
            select: ["itemId", "itemName", "unitId", "unitName"],
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data?.nextPageCursor,
                    query: {
                        isActive: true,
                        itemNameSearchQuery: itemNameSearched,
                    },
                    select: ["itemId", "itemName", "unitId", "unitName"],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Fetch Item on mount */
    useEffect(() => {
        refetchItems();
    }, []);

    /* Error fetching items, show a toast message and go back */
    useEffect(() => {
        if (errorFetchingItems) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingItems")}${i18n.t("comma")}${i18n.t(
                        "contactSupport"
                    )}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingItems]);

    /* On item search changed, set state and refetch items */
    const itemSearchChangeHandler = (text: string) => {
        setItemNameSearched(text);
        debounce(refetchItems, 1000)();
    };

    /* On change of item selected, set state, and pass data to parent */
    const itemChangeHandler = (item: GenericObject) => {
        setSelectedItem(item as Item);
        onChange(item as Item);
    };

    /* Default value  */
    useEffect(() => {
        if (value) {
            setSelectedItem(value);
        }
    }, [value]);
    return (
        <>
            <Dropdown
                label={i18n.t("selectItem")}
                textKey="itemName"
                isSearchable={true}
                data={
                    itemsData?.pages
                        ?.map((itemPage) => itemPage?.data?.items)
                        ?.flat() || []
                }
                customEqualsFunction={(item1, item2) =>
                    item1.itemId === item2.itemId
                }
                isDynamicSearchable={true}
                onSearchChangeHandler={itemSearchChangeHandler}
                onChange={itemChangeHandler}
                value={selectedItem}
                searchPlaceholder={capitalizeText(i18n.t("searchByItemName"))}
                errorMessage={errorMessage}
                onFlatListEndReached={fetchNextPageOfItems}
                isFetchingMoreItems={isFetchingNextPage}
            />
        </>
    );
};

export default InvoiceItemSelector;

const styles = StyleSheet.create({});
