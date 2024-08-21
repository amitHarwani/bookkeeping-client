import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import FilterIcon from "@/assets/images/filter_icon.png";
import { i18n } from "@/app/_layout";
import { fonts } from "@/constants/fonts";

interface FilterButtonProps {
    onPress(): void;
    isDisabled?: boolean;
    extraContainerStyles?: Object;
    extraTextStyles?: Object;
}
const FilterButton = ({
    onPress,
    isDisabled = false,
    extraContainerStyles,
    extraTextStyles,
}: FilterButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={[styles.container, extraContainerStyles]}
        >
            <Image
                source={FilterIcon}
                resizeMode="contain"
                style={styles.filterIcon}
            />
            <Text style={[styles.filterText, extraTextStyles]}>
                {i18n.t("filter")}
            </Text>
        </Pressable>
    );
};

export default FilterButton;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#C5C6CC",
        columnGap: 8,
        alignItems: 'center'
    },
    filterIcon: {
        width: 12,
        height: 12,
    },
    filterText: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 12,
        textTransform: "capitalize",
    },
});
