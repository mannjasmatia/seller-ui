import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import Input from '../../components/BasicComponents/Input';
import Button from '../../components/BasicComponents/Button';
import DynamicImage from '../../components/BasicComponents/Image';
import useCompleteProfile from './useCompleteProfile';
import CategoryFilterDropdown from '../products/components/CategoryFilterDropdown';
import CategoryDropdown from '../../components/category-dropdown/CategoryDropdown';
import BusinessTypeDropdown from '../../components/business-types-dropdown/BusinessTypesDropdown';
import StateDropdown from '../../components/state-city-dropdown/StateDropdown';

const CompleteProfile = () => {
  const language = useSelector((state: RootState) => state.language?.value)['completeProfile'];

  const {
    formState,
    errors,
    provinces,
    inputFields,
    handleChange,
    handleCategoryChange,
    handleBusinessTypeChange,
    handleSubmit,
    handleFileUpload,
    removeUploadedFile,
    uploadedFiles,
    isPending,
    isError,
    error,
  } = useCompleteProfile();

  const [openDropdown,setOpenDropdown] = useState<boolean>(false)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-cb-red px-6 py-4">
            <div className="flex items-center">
              <img src="/logo_light.png" alt="Canadian Bazaar" className="h-8 mr-4" />
              <div>
                <h1 className="text-2xl font-bold text-white">{language.title}</h1>
                <p className="text-white/90 text-sm">{language.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">{language.notice.title}</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>{language.notice.description}</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{language.notice.point1}</li>
                        <li>{language.notice.point2}</li>
                        <li>{language.notice.point3}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Company Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{language.sections.companyInfo}</h2>
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        {inputFields.slice(0, 1).map((field) => (
                            <div key={field.name}>
                                <Input
                                    {...field}
                                    value={formState[field.name as keyof typeof formState]}
                                    onChange={handleChange}
                                    error={errors[field.name]}
                                    className=''
                                    fullWidth
                                />
                            </div>
                            ))}
                    </div>
                    <div className="grid grid-cols-1 mb-5 ">
                        <BusinessTypeDropdown
                            limit={10}
                            label={language.fields.businessType}
                            selectedBusinessType={formState.businessType}
                            onChange={handleBusinessTypeChange}
                            placeholder='Select business type of your company'
                        />
                        <p className="text-cb-red text-sm">
                            {errors['businessType'] ?? '' }
                        </p>
                    </div>
                    <div className="grid grid-cols-1 ">
                        <CategoryDropdown
                            limit={10}
                            label={language.fields.categories}
                            selectedCategories={formState.categories}
                            onChange={handleCategoryChange}
                            placeholder='Select categories of your products'
                        />
                        <p className="text-cb-red text-sm">
                            {errors['categories'] ?? '' }
                        </p>
                    </div>
                    
              </div>

              {/* Business Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{language.sections.businessDetails}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inputFields.slice(1, 2).map((field) => (
                    <Input
                      key={field.name}
                      {...field}
                      value={formState[field.name as keyof typeof formState]}
                      onChange={handleChange}
                      error={errors[field.name]}
                      fullWidth
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 mb-5 ">
                    <StateDropdown
                        label={"State"}
                        selectedState={formState.state}
                        onChange={handleChange}
                        placeholder='Select business type of your company'
                    />
                    <p className="text-cb-red text-sm">
                        {errors['businessType'] ?? '' }
                    </p>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{language.sections.addressInfo}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {inputFields.slice(2).map((field, index) => (
                    <div key={field.name} className={field.name === 'street' ? 'md:col-span-2' : ''}>
                      <Input
                        {...field}
                        value={formState[field.name as keyof typeof formState]}
                        onChange={handleChange}
                        error={errors[field.name]}
                        fullWidth
                        options={
                          field.name === 'state' 
                            ? provinces.map(province => ({ label: province.label, value: province.value }))
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{language.sections.companyLogo}</h2>
                <div className="space-y-4">
                  <Input
                    type="file"
                    name="logo"
                    label={language.fields.logo}
                    accept="image/*"
                    onChange={handleFileUpload}
                    hint={language.fields.logoHint}
                    fullWidth
                  />
                  
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <DynamicImage
                            src={file.preview}
                            alt={`Logo preview ${index + 1}`}
                            width="w-full"
                            height="h-24"
                            objectFit="cover"
                            rounded="md"
                            className="border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {isError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{language.error.title}</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{(error as any)?.response?.data?.message || language.error.generic}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isPending}
                    disabled={isPending}
                    theme={['cb-red', 'white']}
                    className="px-8"
                  >
                    {isPending ? language.submitting : language.submit}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;