// src/pages/AddProduct/AddProduct.tsx
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import ConfirmationModal from '../../modals/ConfirmationModal';
import { useState } from 'react';
import { useAddProduct } from './useAddProduct';
import ProductInfoForm from './components/ProductInfoForm';

const AddProduct: React.FC = () => {
  const {
    formData,
    validationErrors,
    hasUnsavedChanges,
    isCreating,
    isLoadingCategories,
    categories,
    updateFormData,
    getError,
    addAboutPoint,
    removeAboutPoint,
    updateAboutPoint,
    saveProduct,
    handleCancel,
    translations
  } = useAddProduct();

  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true);
    } else {
      handleCancel();
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    handleCancel();
  };

  const handleSave = async () => {
    await saveProduct();
  };

  if (isLoadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelClick}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              {translations.navigation.backToProducts}
            </Button>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {translations.addProduct.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {translations.addProduct.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {/* Form Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {translations.productInfo.title}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.productInfo.description}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            <ProductInfoForm
              data={formData}
              categories={categories}
              validationErrors={validationErrors}
              onUpdate={updateFormData}
              getError={getError}
              addAboutPoint={addAboutPoint}
              removeAboutPoint={removeAboutPoint}
              updateAboutPoint={updateAboutPoint}
              translations={translations}
            />
          </div>

          {/* Form Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleCancelClick}
              disabled={isCreating}
            >
              {translations.navigation.cancel}
            </Button>

            <Button
              variant="solid"
              onClick={handleSave}
              disabled={isCreating}
              isLoading={isCreating}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {translations.navigation.save}
            </Button>
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  You have unsaved changes. Save your progress to continue later.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showCancelModal}
        title="Cancel Product Creation"
        description={translations.messages.confirmCancel}
        confirmButtonText="Yes, Cancel"
        cancelButtonText="Continue Adding"
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
      />
    </div>
  );
};

export default AddProduct;