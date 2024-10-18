import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import MoreVertIcon from "@/assets/images/more_vert_icon.png";
import { commonStyles } from "@/utils/common_styles";

export type HeaderOptionType = {
    optionId: number;
    optionLabel: string;
};
interface HeaderMoreOptionsProps {
    options: Array<HeaderOptionType>;
    onOptionClick(optionId: number): void;
}
const HeaderMoreOptions = ({
    options,
    onOptionClick,
}: HeaderMoreOptionsProps) => {
    /* Menu Visibility State */
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    /* Toggle Menu  */
    const toggleMenu = useCallback(() => {
        setIsMenuVisible((prev) => !prev);
    }, [isMenuVisible]);

    return (
        <View>
            <Pressable onPress={toggleMenu}>
                <Image
                    source={MoreVertIcon}
                    style={commonStyles.moreOptionsVertIcon}
                />
            </Pressable>

            <Modal
                visible={isMenuVisible}
                onRequestClose={toggleMenu}
                transparent={true}
            >
                <Pressable onPress={toggleMenu} style={styles.modalOverlay}>
                    <View style={[styles.menuContainer]}>
                        {options.map((option) => (
                            <Pressable
                                key={option.optionId}
                                onPress={() => onOptionClick(option.optionId)}
                            >
                                <Text
                                    style={[
                                        commonStyles.capitalize,
                                        commonStyles.textMedium,
                                    ]}
                                >
                                    {option.optionLabel}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default HeaderMoreOptions;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "flex-end",
        borderWidth: 1,
    },
    menuContainer: {
        backgroundColor: "white",
        borderRadius: 5,
        padding: 10,
        marginTop: 45,
        marginRight: 20,
        elevation: 5,
        rowGap: 10,
    },
});
