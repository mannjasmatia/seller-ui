// src/pages/EditProduct/EditProduct.tsx
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Save, CheckCircle } from "lucide-react";
import Button from "../../components/BasicComponents/Button";
import ConfirmationModal from "../../modals/ConfirmationModal";
import { useEditProduct } from "./useEditProduct";
import ProductInfoStep from "./components/ProductInfoStep";
import ProductAttributesStep from "./components/ProductAttributesStep";
import ProductImagesStep from "./components/ProductImagesStep";
import ProductPricingStep from "./components/ProductPricingStep";
import ProductVariationsStep from "./components/ProductVariationsStep";
import ProductServicesStep from "./components/ProductServicesStep";
import ProductDescriptionStep from "./components/ProductDescriptionStep";
import StepNavigation from "./components/StepNavigation";

const EditProduct: React.FC = () => {
  const {
    formData,
    validationErrors,
    completedSteps,
    currentStepIndex,
    currentStep,
    isPending,
    isCurrentStepLoading,
    progressPercentage,
    categories,
    pendingNavigationStep,
    hasUnsavedChanges, // Now uses change tracking
    hasCurrentStepChanged, // New function
    handleNavigationConfirm,
    setPendingNavigationStep,
    removeImage,
    navigateToStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    saveCurrentStep,
    saveAndNext,
    uploadImages,
    isStepCompleted,
    STEPS,
    translations,
  } = useEditProduct();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  // Loading state for current step
  if (isCurrentStepLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading step data...</p>
        </div>
      </div>
    );
  }

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Update the navigation handling to not block when there are no changes:
  const handleNavigation = (stepIndex: number) => {
    if (!hasCurrentStepChanged()) {
      // No changes, navigate directly
      navigateToStep(stepIndex, true);
      return;
    }

    const blocked = !navigateToStep(stepIndex);
    if (blocked) {
      setShowNavigationModal(true);
    }
  };

  // Update the handleNext function:
  const handleNext = async () => {
    if (isLastStep) {
      if (hasCurrentStepChanged()) {
        await saveCurrentStep();
      }
      // Could navigate to products list or show completion message
      return;
    }

    if (hasCurrentStepChanged()) {
      await saveAndNext();
    } else {
      goToNextStep();
    }
  };

  const handleCancel = () => {
    if (hasCurrentStepChanged()) {
      setShowCancelModal(true);
    } else {
      window.history.back();
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    window.history.back();
  };

  const renderCurrentStep = () => {
    const stepProps = {
      validationErrors,
      translations,
    };

    switch (currentStep) {
      case "productInfo":
        return (
          <ProductInfoStep
            {...stepProps}
            data={formData.productInfo}
            categories={categories}
            onUpdate={(data) => updateFormData("productInfo", data)}
          />
        );

      case "attributes":
        return (
          <ProductAttributesStep
            {...stepProps}
            data={formData.attributes}
            onUpdate={(data) => updateFormData("attributes", data)}
          />
        );

      case 'images':
        return (
            <ProductImagesStep
            data={formData.images}
            validationErrors={validationErrors}
            onUpdate={(data) => updateFormData('images', data)}
            onUpload={(files) => uploadImages(files, 'images')}
            onRemove={(index) => removeImage(index, 'images')}
            translations={translations}
            />
        );

      case "pricing":
        return (
          <ProductPricingStep
            {...stepProps}
            data={formData.pricing}
            onUpdate={(data) => updateFormData("pricing", data)}
          />
        );

      case "variations":
        return (
          <ProductVariationsStep
            {...stepProps}
            data={formData.variations}
            onUpdate={(data) => updateFormData("variations", data)}
          />
        );

      case "services":
        return (
          <ProductServicesStep
            {...stepProps}
            data={formData.services}
            onUpdate={(data) => updateFormData("services", data)}
          />
        );

      case "description":
        return (
          <ProductDescriptionStep
            {...stepProps}
            data={formData.description}
            onUpdate={(data) => updateFormData("description", data)}
            onUploadImages={(files) => uploadImages(files, "description")}
          />
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {translations.editProduct.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {translations.editProduct.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {translations.progress.completion}
                </p>
                <p className="text-2xl font-bold text-cb-red">
                  {progressPercentage}%
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                {translations.navigation.cancel}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <StepNavigation
                steps={STEPS}
                currentStep={currentStepIndex}
                completedSteps={completedSteps}
                onStepClick={handleNavigation}
                translations={translations}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Step Header */}
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {translations.steps[currentStep]?.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {translations.steps[currentStep]?.description}
                    </p>
                  </div>

                  {isStepCompleted(currentStepIndex) && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="px-8 py-8">{renderCurrentStep()}</div>

              {/* Step Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div>
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={isPending}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      {translations.navigation.previous}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Only show save button when there are changes */}
                  {hasCurrentStepChanged() && (
                    <Button
                      variant="outline"
                      onClick={saveCurrentStep}
                      disabled={isPending}
                      isLoading={isPending}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      {translations.navigation.save}
                    </Button>
                  )}

                  <Button
                    variant="solid"
                    onClick={handleNext}
                    disabled={isPending}
                    isLoading={isPending}
                    rightIcon={
                      !isLastStep ? (
                        <ArrowRight className="h-4 w-4" />
                      ) : undefined
                    }
                  >
                    {isLastStep
                      ? translations.navigation.finish
                      : hasCurrentStepChanged()
                      ? translations.navigation.saveAndNext
                      : translations.navigation.next}
                  </Button>
                </div>
              </div>
            </div>

            {/* Unsaved Changes Warning */}
            {hasCurrentStepChanged() && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      {translations.messages.unsavedChanges}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showCancelModal}
        title="Cancel Product Editing"
        description={translations.messages.confirmCancel}
        confirmButtonText="Yes, Cancel"
        cancelButtonText="Continue Editing"
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
      />

      <ConfirmationModal
        open={showNavigationModal}
        title="Unsaved Changes"
        description="You have unsaved changes. What would you like to do?"
        confirmButtonText="Save & Continue"
        cancelButtonText="Continue Without Saving"
        confirmButtonClassName="text-sm"
        cancelButtonClassName="text-sm"
        onClose={() => {
          setShowNavigationModal(false);
          handleNavigationConfirm(false);
        //   setPendingNavigationStep(null);
        }}
        onConfirm={() => {
          setShowNavigationModal(false);
          handleNavigationConfirm(true);
        }}
      />
    </div>
  );
};

export default EditProduct;
