import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import CheckMarkIcon from "@/assets/images/checkmark_icon.png";
import React, { useCallback, useEffect, useState } from "react";
import { GenericObject } from "@/constants/types";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";

interface CheckboxProps {
    data: GenericObject;
    description: string;
    descriptionComponent?: React.ReactElement;
    onChange?(data: GenericObject, isChecked: boolean): void;
    value?: boolean;
    errorMessage?: string | null;
    isDisabled?: boolean
}
const Checkbox = ({
    description,
    descriptionComponent,
    data,
    value,
    onChange,
    errorMessage,
    isDisabled = false
}: CheckboxProps) => {
    const [isChecked, setIsChecked] = useState(false);

    /* Toggle isChecked & pass result to onChange function passed from parent */
    const toggleCheck = () => {
        if (typeof onChange === "function") {
            onChange(data, !isChecked);
        }
        setIsChecked((prev) => !prev);
    };

    /* For default values to be passed form parent */
    useEffect(() => {
        if (typeof value === "boolean" && value != isChecked) {
            setIsChecked(value);
        }
    }, [value]);

    return (
        <View style={styles.container}>
            <View style={styles.checkboxContainer}>
                <Pressable
                    onPress={toggleCheck}
                    style={[
                        styles.checkboxButton,
                        isChecked && styles.checkedButton,
                    ]}
                    disabled={isDisabled}
                >
                    {isChecked && (
                        <Image
                            source={CheckMarkIcon}
                            resizeMode="contain"
                            style={styles.checkMark}
                        />
                    )}
                </Pressable>
                {descriptionComponent ? (
                    descriptionComponent
                ) : (
                    <Text style={[isDisabled && commonStyles.textDisabled]}>{description}</Text>
                )}
            </View>
            {errorMessage && (
                <Text style={[commonStyles.textSmallMedium, commonStyles.textError, commonStyles.capitalize]}>{errorMessage}</Text>
            )}
        </View>
    );
};

export default Checkbox;

const styles = StyleSheet.create({
    container: {
        rowGap: 8
    },
    checkboxContainer: {
        flexDirection: "row",
        columnGap: 12,
        alignItems: "center"
    },
    checkboxButton: {
        width: 24,
        height: 24,
        borderWidth: 1.5,
        borderColor: "#C5C6CC",
        borderRadius: 6,
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    checkedButton: {
        backgroundColor: "#006FFD",
    },
    checkMark: {
        width: 18,
        height: 18,
    }
});
