import { i18n } from "@/app/_layout";

type REPORTS_CONFIG_TYPE = {
    [reportKey: string]: {
        fromDateTime: {
            required: boolean;
            type: "DATE" | "DATETIME";
            label: string;
        };
        toDateTime: {
            required: boolean;
            type: "DATE" | "DATETIME";
            label: string;
        };
    };
};
export const REPORTS_CONFIG: REPORTS_CONFIG_TYPE = {
    DAY_END_SUMMARY_REPORT: {
        fromDateTime: {
            required: true,
            type: "DATE",
            label: i18n.t("from"),
        },
        toDateTime: {
            required: true,
            type: "DATE",
            label: i18n.t("to"),
        },
    },
    DAY_END_DETAILED_REPORT: {
        fromDateTime: {
            required: true,
            type: "DATE",
            label: i18n.t("date"),
        },
        toDateTime: {
            required: false,
            type: "DATE",
            label: i18n.t("to"),
        },
    },
    SALE_REPORT: {
        fromDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("from"),
        },
        toDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("to"),
        },
    },
    PURCHASE_REPORT: {
        fromDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("from"),
        },
        toDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("to"),
        },
    },
    SALE_RETURN_REPORT: {
        fromDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("from"),
        },
        toDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("to"),
        },
    },
    PURCHASE_RETURN_REPORT: {
        fromDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("from"),
        },
        toDateTime: {
            required: true,
            type: "DATETIME",
            label: i18n.t("to"),
        },
    },
};
