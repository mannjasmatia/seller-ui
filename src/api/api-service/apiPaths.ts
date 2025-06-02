/**
 * API paths for various CRUD operations
 */
interface SubEndPoints {
    [key: string]: string;
}

interface ApiPaths {
    [key: string]: SubEndPoints;
}

export const apiPaths: ApiPaths = {
    auth:{
        login:"api/v1/auth/login",
        verifyOtp:"api/v1/auth/send-otp",
        signup:"api/v1/auth/signup",
        logout:"api/v1/auth/logout",
        verifyTokens:"api/v1/auth/verify-tokens",
        emailVerificationLink:"api/v1/auth/email-verification-link",
        verifyEmail:"api/v1/auth/verify-email",
        changePassword:"api/v1/auth/change-password",
    },
    category:{
        all:"api/v1/category",
        relatedCategories:"api/v1/category/sub-category",
    },
    categoryStats:{
        popular:"api/v1/category-stats/popular",
        frequentlySearched:"api/v1/category-stats/user-frequent",
        trackSearch:"api/v1/category-stats/track-search",
        trackView:"api/v1/category-stats/track-view",
    },
    product:{
        all:"api/v1/product",
        product:"api/v1/product",
        productById:"api/v1/product",
    },
    productStats:{
        popular:"api/v1/product-stats/popular",
        bestSeller:"api/v1/product-stats/best-seller",
        suggested:"api/v1/product-stats/suggested",
        trackView:"api/v1/product-stats/track-view",
        trackStatus:"api/v1/product-stats/track-status",
        newArrivals:"api/v1/product-stats/new-arrivals",
    },
    like: {
        like: "api/v1/like",
        getLikedProducts:"api/v1/like",
    },
    businessType:{
        all:"api/v1/business-types",
    },
    profile:{
        get:"api/v1/profile",
        update:"api/v1/profile",
        getPreferences:"api/v1/profile/preferences",
        setPreferences:"api/v1/profile/preferences",
    },
    address:{
        get:"api/v1/address",
        add:"api/v1/address",
        update:"api/v1/address",
        delete:"api/v1/address",
    },
    quotation: {
        sendInquiry:"api/v1/quotation",
    },
    notification :{
        get : "api/v1/notifications",
        markAsRead : "api/v1/notifications",
        markAllAsRead : "api/v1/notifications/mark-all-as-read",
        delete : "api/v1/notifications",
    }
};
