export interface Seller {
    _id: string;
    companyName: string;
    phone?: string;
    email?: string;
    businessType?: string; // give businessType to this
    approvalStatus?: 'pending'|'approved'|'rejected'; 
    profileImage?: string;
    city?: string;
    state?: string;
    location?: string;
    isVerified?: boolean;
    zip?: string;
    products?: Product[];
    createdAt?: string;
}