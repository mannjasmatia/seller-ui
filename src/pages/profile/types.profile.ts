export interface ProfileFormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  categories: string[];
  businessNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  profilePic?: File | null | string;
  avatar?: string | null;
}

export interface UploadedFile {
  file: File;
  preview: string;
}