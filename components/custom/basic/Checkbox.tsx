import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import CheckMarkIcon from "@/assets/images/checkmark_icon.png";
import React, { useCallback, useEffect, useState } from "react";
import { GenericObject } from "@/constants/types";
import { fonts } from "@/constants/fonts";

interface CheckboxProps {
    data: GenericObject;
    description: string;
    descriptionComponent?: React.ReactElement;
    onChange?(data: GenericObject, isChecked: boolean): void;
    value?: boolean;
    errorMessage?: string | null;
}
const Checkbox = ({
    description,
    descriptionComponent,
    data,
    value,
    onChange,
    errorMessage,
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
        if (value && value != isChecked) {
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
                    <Text>{description}</Text>
                )}
            </View>
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
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
    },
    errorText: {
        fontSize: 12,
        fontFamily: fonts.Inter_Medium,
        color: "#FF616D",
        textTransform: "capitalize",
    },
});