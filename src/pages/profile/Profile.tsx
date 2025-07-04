import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import { Edit, Save, X, Upload, Camera } from 'lucide-react';
import useProfile from './useProfile';
import Input from '../../components/BasicComponents/Input';
import Button from '../../components/BasicComponents/Button';
import DynamicImage from '../../components/BasicComponents/Image';
import CategoryDropdown from '../../components/category-dropdown/CategoryDropdown';
import BusinessTypeDropdown from '../../components/business-types-dropdown/BusinessTypesDropdown';
import MediaModal from '../../modals/MediaModal';
import VerifyOtpModal from '../../modals/verify-otp/VerifyOtpModal';
import StateDropdown from '../../components/state-city-dropdown/StateDropdown';
import CityDropdown from '../../components/state-city-dropdown/CItyDropdown';

const Profile: React.FC = () => {
  const language = useSelector((state: RootState) => state.language?.value)['profile'];
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Canadian Bazaar" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{language.title}</h1>
          <p className="text-gray-600">{language.subtitle}</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Profile Picture Section */}
          <div className="bg-gradient-to-r from-cb-red to-red-600 px-6 py-8">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105"
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
              
              <h2 className="text-2xl font-bold text-white mt-4 text-center">
                {formState.fullName || 'Your Name'}
              </h2>
              <p className="text-white/90 text-center">
                {formState.email || 'your@email.com'}
              </p>
              
              {/* Edit/Save buttons */}
              <div className="mt-4 flex gap-3">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      {language.cancel}
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={handleSave}
                      isLoading={isUpdating}
                      className="bg-white text-cb-red hover:bg-gray-100"
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      {isUpdating ? language.saving : language.save}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    {language.edit}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  {language.sections.companyInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.fullName}
                        placeholder={language.placeholders.fullName}
                        value={formState.fullName}
                        onChange={handleChange('fullName')}
                        error={errors.fullName}
                        validation={validationRules.fullName}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.fullName}
                        </label>
                        <p className="text-gray-900 font-medium">{formState.fullName || '-'}</p>
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
                        onChange={handleChange('email')}
                        error={errors.email}
                        validation={validationRules.email}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.email}
                        </label>
                        <p className="text-gray-900 font-medium">{formState.email || '-'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {isEditing ? (
                      <Input
                        type="tel"
                        label={language.fields.phoneNumber}
                        placeholder={language.placeholders.phoneNumber}
                        value={formState.phoneNumber}
                        onChange={handleChange('phoneNumber')}
                        error={errors.phoneNumber}
                        validation={validationRules.phoneNumber}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.phoneNumber}
                        </label>
                        <p className="text-gray-900 font-medium">{formState.phoneNumber || '-'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {isEditing ? (
                      <div>
                        <BusinessTypeDropdown
                          label={language.fields.businessType}
                          selectedBusinessTypes={formState.businessType}
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
                        <p className="text-gray-900 font-medium">{formState.businessType || '-'}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  {isEditing ? (
                    <div>
                      <CategoryDropdown
                        label={language.fields.categories}
                        selectedCategories={formState.categories}
                        onChange={handleCategoryChange}
                        placeholder={language.placeholders.categories}
                        allowSelectAll={true}
                      />
                      {errors.categories && (
                        <p className="text-cb-red text-sm mt-1">{errors.categories}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language.fields.categories}
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formState.categories.length > 0 ? `${formState.categories.length} categories selected` : '-'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  {language.sections.businessDetails}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.businessNumber}
                        placeholder={language.placeholders.businessNumber}
                        value={formState.businessNumber}
                        onChange={handleChange('businessNumber')}
                        error={errors.businessNumber}
                        validation={validationRules.businessNumber}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.businessNumber}
                        </label>
                        <p className="text-gray-900 font-medium">{formState.businessNumber || '-'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  {language.sections.addressInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    {isEditing ? (
                      <Input
                        type="text"
                        label={language.fields.street}
                        placeholder={language.placeholders.street}
                        value={formState.street}
                        onChange={handleChange('street')}
                        error={errors.street}
                        validation={validationRules.street}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.street}
                        </label>
                        <p className="text-gray-900 font-medium">{formState.street || '-'}</p>
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
                        <p className="text-gray-900 font-medium">
                          {provinces.find(p => p.value === formState.state)?.label || '-'}
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
                        <p className="text-gray-900 font-medium">{formState.city || '-'}</p>
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
                        onChange={handleChange('zip')}
                        error={errors.zip}
                        validation={validationRules.zip}
                        fullWidth
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language.fields.zip}
                        </label>
                        <p className="text-gray-900 font-medium">{formState.zip || '-'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload Section (Only visible in edit mode) */}
              {isEditing && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                    {language.sections.profilePicture}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      onClick={handleFileInputClick}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      {language.imageActions.uploadImage}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAvatarModalOpen(true)}
                      leftIcon={<Camera className="w-4 h-4" />}
                    >
                      {language.imageActions.chooseAvatar}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {language.imageActions.longPressToView}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Avatar Selection Modal */}
      {/* <AvatarModal
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleSelectAvatar}
        maxAvatars={50}
        avatarsPerRow={8}
      /> */}

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