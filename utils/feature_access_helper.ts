import store from "@/store";

export const isFeatureAccessible = (featureId: number): boolean => {
    const reduxState = store.getState();

    /* Platform feature state */
    const platformFeature =
        reduxState.platformFeatures.platformFeatures?.[featureId];

    /* If the feature is not enabled at the platform level, return false */
    if (!platformFeature || !platformFeature?.isEnabled) {
        return false;
    }

    /* UsersACL of selectedCompany */
    const userHasAccess = reduxState.company.userACL?.[featureId];


    /* If the user does not have access to the feature return false */
    if (!userHasAccess) {
        return false;
    }

    return true;
};
