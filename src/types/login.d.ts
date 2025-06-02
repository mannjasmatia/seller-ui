export interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    handleSignupClick: () => void;
    handleSuccessfullLogin: () => void;
  }

  // Not using this anywhere as of now
export interface UserInfo {
  _id: string;
  fullName:string;
  phoneNumber:string;
  city:string;
  state:string;
  memberId:string;
}