import { i18n } from "@/app/_layout";
import { GenericObject, ReturnItemSelectorType } from "@/constants/types";
import { capitalizeText } from "@/utils/common_utils";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Dropdown from "../basic/Dropdown";

interface ReturnsItemSelectorProps {
    itemsData: Array<ReturnItemSelectorType>;
    value?: ReturnItemSelectorType;
    onChange(item: ReturnItemSelectorType): void;
    errorMessage?: string | null;
}
const ReturnsItemSelector = ({
    itemsData,
    value,
    onChange,
    errorMessage,
}: ReturnsItemSelectorProps) => {
    /* Selected Item */
    const [selectedItem, setSelectedItem] = useState<ReturnItemSelectorType>();

    /* On change of item selected, set state, and pass data to parent */
    const itemChangeHandler = (item: GenericObject) => {
        setSelectedItem(item as ReturnItemSelectorType);
        onChange(item as ReturnItemSelectorType);
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
                data={itemsData}
                customEqualsFunction={(item1, item2) =>
                    item1.itemId === item2.itemId
                }
                onChange={itemChangeHandler}
                value={selectedItem}
                searchPlaceholder={capitalizeText(i18n.t("searchByItemName"))}
                errorMessage={errorMessage}
            />
        </>
    );
};

export default ReturnsItemSelector;

const styles = StyleSheet.create({});
