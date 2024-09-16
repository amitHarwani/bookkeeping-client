import { i18n } from "@/app/_layout";
import { TableColDefType } from "./types";
import { capitalizeText } from "@/utils/common_utils";

export const topSellersColDef: Array<TableColDefType> = [
    {
        id: "itemName",
        text: i18n.t("itemName"),
    },
    {
        id: "totalUnitsSold",
        text: i18n.t("totalUnitsSold"),
    },
];

export const lowStockItemsColDef: Array<TableColDefType> = [
    {
        id: "itemName",
        text: i18n.t("itemName"),
        extraCellProps: {
            numberOfLines: 2
        }
    },
    {
        id: "stock",
        text: i18n.t("stock"),
    },
    {
        id: "minStockToMaintain",
        text: i18n.t("minStock"),
    },
];
