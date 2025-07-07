export interface ProfileFormState {
  companyName: string;
  email: string;
  phone: string;
  businessType: string;
  categories: string[];
  businessNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  logo?: File | null | string;
  avatar?: string | null;
}

export interface UploadedFile {
  file: File;
  preview: string;
}