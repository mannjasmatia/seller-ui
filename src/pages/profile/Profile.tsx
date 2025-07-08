import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/appStore";
import { Edit, Save, X, Upload, Camera, User, Building, MapPin, Phone, Mail, Hash, LogOut } from "lucide-react";
import useProfile from "./useProfile";
import Input from "../../components/BasicComponents/Input";
import Button from "../../components/BasicComponents/Button";
import DynamicImage from "../../components/BasicComponents/Image";
import CategoryDropdown from "../../components/category-dropdown/CategoryDropdown";
import BusinessTypeDropdown from "../../components/business-types-dropdown/BusinessTypesDropdown";
import MediaModal from "../../modals/MediaModal";
import VerifyOtpModal from "../../modals/verify-otp/VerifyOtpModal";
import StateDropdown from "../../components/state-city-dropdown/StateDropdown";
import CityDropdown from "../../components/state-city-dropdown/CItyDropdown";
import AvatarModal from "./components/AvatarModal";
import ConfirmationModal from "../../modals/ConfirmationModal";

const Profile: React.FC = () => {
  const language = useSelector((state: RootState) => state.language?.value)["profile"];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    // State
    formState,
    isEditing,
    errors,
    preview,
    provinces,

    // Modal states
    isAvatarModalOpen,
    isMediaModalOpen,
    isEmailOtpModalOpen,
    isPhoneOtpModalOpen,

    // Loading states
    isUpdating,
    isSendingEmailOtp,
    isSendingPhoneOtp,
    isVerifyingEmailOtp,
    isVerifyingPhoneOtp,

    // Handlers
    handleChange,
    handleCategoryChange,
    handleBusinessTypeChange,
    handleStateChange,
    handleCityChange,
    handleFileUpload,
    handleSelectAvatar,
    handleEdit,
    handleCancel,
    handleSave,
    handleMouseDown,
    handleMouseUp,
    handleEmailOtpVerification,
    handlePhoneOtpVerification,
    handleResendEmailOtp,
    handleResendPhoneOtp,

    // Utilities
    getCitiesForState,
    validationRules,

    // Modal handlers
    setIsAvatarModalOpen,
    setIsMediaModalOpen,
    setIsEmailOtpModalOpen,
    setIsPhoneOtpModalOpen,

    //logout modal
    isLogoutModalOpen,
    setIsLogoutModalOpen,
    isLoggingOut,
    handleLogout,

    // Temp data
    tempEmail,
    tempPhoneNumber,
  } = useProfile();

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{language.title}</h1>
                <p className="mt-2 text-gray-600">{language.subtitle}</p>
              </div>
              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      leftIcon={<X className="w-4 h-4" />}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {language.cancel}
                    </Button>
                    <Button
                      variant="solid"
                      onClick={handleSave}
                      isLoading={isUpdating}
                      leftIcon={<Save className="w-4 h-4" />}
                      theme={['cb-red', 'white']}
                    >
                      {isUpdating ? language.saving : language.save}
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsLogoutModalOpen(true)}
                      leftIcon={<LogOut className="w-4 h-4" />}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Logout
                    </Button>
                    <Button
                      variant="solid"
                      onClick={handleEdit}
                      leftIcon={<Edit className="w-4 h-4" />}
                      theme={['cb-red', 'white']}
                    >
                      {language.edit}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Picture & Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              {/* Profile Picture Section */}
              <div className="p-6 text-center border-b border-gray-200">
                <div className="relative group inline-block">
                  <div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg cursor-pointer transition-all duration-300 hover:border-cb-red mx-auto"
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <DynamicImage
                      src={preview}
                      alt="Profile Picture"
                      width="w-full"
                      height="h-full"
                      objectFit="cover"
                      className="transition-all duration-300"
                    />
                  </div>

                  {/* Edit overlay for profile picture */}
                  {isEditing && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {formState.companyName || "Your Name"}
                </h2>
                <p className="text-gray-600">{formState.email || "your@email.com"}</p>

                {/* Image Upload Actions (Only visible in edit mode) */}
                {isEditing && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFileInputClick}
                      leftIcon={<Upload className="w-4 h-4" />}
                      fullWidth
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {language.imageActions.uploadImage}
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAvatarModalOpen(true)}
                      leftIcon={<Camera className="w-4 h-4" />}
                      fullWidth
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {language.imageActions.chooseAvatar}
                    </Button> */}
                    <p className="text-xs text-gray-500">{language.imageActions.longPressToView}</p>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-4 h-4 text-cb-red flex-shrink-0" />
                  <span className="text-sm">{formState.phone || "No phone number"}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-4 h-4 text-cb-red flex-shrink-0" />
                  <span className="text-sm">{formState.email || "No email"}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Building className="w-4 h-4 text-cb-red flex-shrink-0" />
                  <span className="text-sm">
                    <BusinessTypeDropdown
                      selectedBusinessType={formState.businessType}
                      onChange={handleBusinessTypeChange}
                      mode="view"
                    />
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-4 h-4 text-cb-red flex-shrink-0" />
                  <span className="text-sm">
                    {formState.city && formState.state
                      ? `${formState.city}, ${provinces.find((p) => p.value === formState.state)?.label}`
                      : "No address"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Form Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cb-red rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{language.sections.companyInfo}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.companyName}
                        placeholder={language.placeholders.companyName}
                        value={formState.companyName}
                        onChange={handleChange("companyName")}
                        error={errors.companyName}
                        validation={validationRules.companyName}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.companyName}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.companyName || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <Input
                        type="email"
                        label={language.fields.email}
                        placeholder={language.placeholders.email}
                        value={formState.email}
                        onChange={handleChange("email")}
                        error={errors.email}
                        validation={validationRules.email}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.email}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.email || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <Input
                        type="tel"
                        label={language.fields.phone}
                        placeholder={language.placeholders.phone}
                        value={formState.phone}
                        onChange={handleChange("phone")}
                        error={errors.phone}
                        validation={validationRules.phone}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.phone}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.phone || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <div>
                        <BusinessTypeDropdown
                          label={language.fields.businessType}
                          selectedBusinessType={formState.businessType}
                          onChange={handleBusinessTypeChange}
                          placeholder={language.placeholders.businessType}
                        />
                        {errors.businessType && (
                          <p className="text-cb-red text-sm mt-1">{errors.businessType}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.businessType}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          <BusinessTypeDropdown
                            selectedBusinessType={formState.businessType}
                            onChange={handleBusinessTypeChange}
                            mode="view"
                          />
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    {isEditing ? (
                      <div>
                        <CategoryDropdown
                          label={language.fields.categories}
                          selectedCategories={formState.categories}
                          onChange={handleCategoryChange}
                          placeholder={language.placeholders.categories}
                          allowSelectAll={true}
                        />
                        {errors.categories && <p className="text-cb-red text-sm mt-1">{errors.categories}</p>}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.categories}
                        </label>
                        <div className="bg-gray-50 px-3 py-2 rounded-md min-h-[42px] flex items-center">
                          {formState.categories.length > 0 ? (
                            <CategoryDropdown
                              selectedCategories={formState.categories}
                              onChange={handleCategoryChange}
                              disabled={true}
                            />
                          ) : (
                            <span className="text-gray-900">-</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cb-red rounded-lg flex items-center justify-center">
                    <Hash className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{language.sections.businessDetails}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.businessNumber}
                        placeholder={language.placeholders.businessNumber}
                        value={formState.businessNumber}
                        onChange={handleChange("businessNumber")}
                        error={errors.businessNumber}
                        validation={validationRules.businessNumber}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.businessNumber}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.businessNumber || "-"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cb-red rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{language.sections.addressInfo}</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.street}
                        placeholder={language.placeholders.street}
                        value={formState.street}
                        onChange={handleChange("street")}
                        error={errors.street}
                        validation={validationRules.street}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.street}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.street || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <StateDropdown
                        label={language.fields.state}
                        selectedState={formState.state}
                        onChange={handleStateChange}
                        placeholder={language.placeholders.state}
                        error={errors.state}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.state}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {provinces.find((p) => p.value === formState.state)?.label || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <CityDropdown
                        label={language.fields.city}
                        selectedCity={formState.city}
                        selectedState={formState.state}
                        onChange={handleCityChange}
                        placeholder={language.placeholders.city}
                        error={errors.city}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.city}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.city || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.zip}
                        placeholder={language.placeholders.zip}
                        value={formState.zip}
                        onChange={handleChange("zip")}
                        error={errors.zip}
                        validation={validationRules.zip}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.zip}
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                          {formState.zip || "-"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {/* Media Modal for viewing profile picture */}
      <MediaModal
        open={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        src={preview}
        type="image"
        title={language.mediaModal.title}
        download={true}
        downloadText={language.mediaModal.download}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        open={isLogoutModalOpen}
        title="Logout Confirmation"
        description="Are you sure you want to logout? You will be redirected to the login page."
        confirmButtonText="Logout"
        cancelButtonText="Cancel"
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
        theme={['cb-red', 'white']}
      />

      {/* Avatar Selection Modal - Not used */}
      {/* <AvatarModal
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleSelectAvatar}
        maxAvatars={50}
        avatarsPerRow={8}
      /> */}

      {/* Email OTP Verification Modal */}
      <VerifyOtpModal
        open={isEmailOtpModalOpen}
        title={language.verification.emailVerificationTitle}
        description={language.verification.emailVerificationDesc}
        otpLength={6}
        onClose={() => setIsEmailOtpModalOpen(false)}
        handleVerifyOtpClick={handleEmailOtpVerification}
        handleResendOtp={handleResendEmailOtp}
        expiryTime={300}
        isLoading={isVerifyingEmailOtp}
        isError={false}
      />

      {/* Phone OTP Verification Modal */}
      <VerifyOtpModal
        open={isPhoneOtpModalOpen}
        title={language.verification.phoneVerificationTitle}
        description={language.verification.phoneVerificationDesc}
        otpLength={6}
        onClose={() => setIsPhoneOtpModalOpen(false)}
        handleVerifyOtpClick={handlePhoneOtpVerification}
        handleResendOtp={handleResendPhoneOtp}
        expiryTime={300}
        isLoading={isVerifyingPhoneOtp}
        isError={false}
      />
    </div>
  );
};

export default Profile;