import * as SecureStore from "expo-secure-store";

export const setValueInSecureStore = (key: string, value: string): void => {
    SecureStore.setItem(key, value);
};

export const getValueFromSecureStore = (key: string): string | null => {
    return SecureStore.getItem(key);
};

export const deleteValueFromSecureStore = async (key: string) => {
    await SecureStore.deleteItemAsync(key);
};
