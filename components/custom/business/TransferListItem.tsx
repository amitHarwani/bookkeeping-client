import { i18n } from "@/app/_layout";
import {
    SaleTypeInSalesList,
    TransferType,
    TransferTypeInTransfersList,
} from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import ArrowSent from "@/assets/images/arrow_sent.png";
import ArrowReceived from "@/assets/images/arrow_received.png";
import { convertUTCStringToTimezonedDate } from "@/utils/common_utils";
import {
    dateTimeFormat24hr,
    displayedDateTimeFormat,
} from "@/constants/datetimes";
import moment from "moment";

interface TransferListItemProps {
    transfer: TransferTypeInTransfersList;
    onPress(transfer: TransferTypeInTransfersList): void;
}
const TransferListItem = ({ transfer, onPress }: TransferListItemProps) => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const timezone = useAppSelector(
        (state) => state.company.country?.timezone
    ) as string;

    /* Transfer type */
    const transferType = useMemo(() => {
        /* If from company id is same as current company id, transfer type is sent, else transfer type is received */
        if (transfer.fromCompanyId == selectedCompany?.companyId) {
            return TransferType.sent;
        } else {
            return TransferType.received;
        }
    }, [transfer]);

    return (
        <Pressable onPress={() => onPress(transfer)} style={styles.container}>
            <Text style={[commonStyles.textSmall]} numberOfLines={2}>
                {moment(
                    convertUTCStringToTimezonedDate(
                        transfer.createdAt as string,
                        dateTimeFormat24hr,
                        timezone
                    )
                ).format(displayedDateTimeFormat)}
            </Text>

            <Text style={[commonStyles.textSmall, {maxWidth: "50%"}]} numberOfLines={1}>
                {transferType == TransferType.sent
                    ? transfer.toCompanyName
                    : transfer.fromCompanyName}
            </Text>

            <Image
                source={
                    transferType == TransferType.sent
                        ? ArrowSent
                        : ArrowReceived
                }
                style={styles.arrowImage}
            />
        </Pressable>
    );
};

export default TransferListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    arrowImage: {
        width: 24,
        height: 24,
    },
});
