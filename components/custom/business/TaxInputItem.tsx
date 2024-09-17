import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { TaxDetail } from "@/services/sysadmin/sysadmin_types";
import RadioButton from "../basic/RadioButton";
import { i18n } from "@/app/_layout";
import Input from "../basic/Input";
import { GenericObject } from "@/constants/types";
import { capitalizeText } from "@/utils/common_utils";

interface TaxInputItemProps {
    taxInfo: TaxDetail;
    onRegistered?(): void;
    onDeregistered?(): void;
    onChange?(taxRegistrationNumber: string): void;
    value?: { isTaxRegistered: boolean; registrationNumber: string };
    isDisabled?: boolean;
}
const TaxInputItem = ({
    taxInfo,
    onRegistered,
    onDeregistered,
    onChange,
    value,
    isDisabled = false,
}: TaxInputItemProps) => {
    /* Whether the user has registered for this tax */
    const [isTaxRegistered, setIsTaxRegistered] = useState(false);

    /* Registration Number */
    const [taxRegistrationNumber, setTaxRegistrationNumber] = useState("");

    /* Yes no, radio button data */
    const radioButtonData = useMemo(() => {
        return [{ key: "yes" }, { key: "no" }];
    }, []);

    /* On change of radio button */
    const radioButtonChangeHandler = (selectedItem: GenericObject) => {
        /* If yes is selected, setIsTaxRegisted to true, else false */
        if (selectedItem.key === "yes") {
            setIsTaxRegistered(true);

            /* If onRegister function is passed, call it to notify that the user is registered with this tax */
            if (typeof onRegistered === "function") {
                onRegistered();
            }
        } else {
            setIsTaxRegistered(false);

            /* If onDeregister function is passed, call it to notify that the user has deregistered with this tax */
            if (typeof onDeregistered === "function") {
                onDeregistered();
            }
        }
    };

    /* On change of tax registration number */
    const taxRegistrationNumberChangeHandler = (text: string) => {
        setTaxRegistrationNumber(text);
        if (typeof onChange === "function") {
            onChange(text);
        }
    };

    useEffect(() => {
        /* If registration is mandatory */
        if (!taxInfo.isRegistrationOptional) {
            setIsTaxRegistered(true);

            /* If onRegister function is passed, call it to notify that the 
            user is registered with this tax, since the tax is mandatory */
            if (typeof onRegistered === "function") {
                onRegistered();
            }
        }
    }, [taxInfo]);

    /* For default values */
    useEffect(() => {
        if (value) {
            setIsTaxRegistered(value.isTaxRegistered);
            setTaxRegistrationNumber(value.registrationNumber);
        }
    }, [value]);

    return (
        <View style={styles.container}>
            {taxInfo.isRegistrationOptional && (
                <RadioButton
                    data={radioButtonData}
                    textKey={"key"}
                    label={`${taxInfo.taxName} ${i18n.t("registered")}${i18n.t(
                        "questionMark"
                    )}`}
                    onChange={radioButtonChangeHandler}
                    value={
                        isTaxRegistered
                            ? radioButtonData[0]
                            : radioButtonData[1]
                    }
                    isDisabled={isDisabled}
                />
            )}

            {isTaxRegistered && (
                <Input
                    label={`${taxInfo.taxName} ${i18n.t("number")}`}
                    placeholder={`${capitalizeText(
                        i18n.t("enterRegistrationNumber")
                    )}`}
                    value={taxRegistrationNumber}
                    onChangeText={taxRegistrationNumberChangeHandler}
                    isDisabled={isDisabled}
                />
            )}
        </View>
    );
};

export default TaxInputItem;

const styles = StyleSheet.create({
    container: {
        rowGap: 16,
    },
});
