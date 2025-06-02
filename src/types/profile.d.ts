// Types
export interface Address {
    _id: string;
    buyerId: string;
    isDefault: boolean;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    addressType?: string;
}

export interface PaymentMethod {
    _id: string;
    name: string;
    imageUrl: string;
    isActive: boolean;
}

export interface Currency {
    _id: string;
    code: string;
    name: string;
    symbol: string;
    isActive: boolean;
}

export interface Language {
    _id: string;
    code: string;
    name: string;
    isActive: boolean;
}

// Define profile interface
export interface ProfileData {
    fullName: string;
    email: string;
    phoneNumber: string;
    memberId: string;
    state: string;
    city: string;
    createdAt: string;
    profilePic?: File | null | string;
    avatar?: string | null;
    country?: string;
    paymentMethods?:PaymentMethod[];
    preferredCurrency?:Currency;
    preferredLanguage?:Language;
}

// Define validation rules interface
export interface ValidationRules {
    [key: string]: {
        required?: boolean;
        pattern?: RegExp;
        errorMessages: {
            required?: string;
            pattern?: string;
        };
    };
}

// Define preferences interface
export interface Preferences {
    languages: Language[];
    currencies: Currency[];
    paymentMethods: PaymentMethod[];
}