// src/pages/EditProduct/components/StepNavigation.tsx
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { ProductStep } from '../types.edit-product';

interface StepNavigationProps {
  steps: ProductStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (stepIndex: number) => void;
  translations: any;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  translations
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'available';
  };

  const getStepIcon = (stepIndex: number, status: string) => {
    const isIncomplete = !completedSteps.has(stepIndex) && stepIndex !== currentStep;
    
    if (status === 'completed') {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      );
    }
    
    return (
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${status === 'current' 
          ? 'bg-cb-red text-white' 
          : isIncomplete
          ? 'bg-yellow-400 text-white animate-pulse'
          : 'bg-gray-300 text-gray-700 hover:bg-cb-red hover:text-white cursor-pointer'
        }
      `}>
        {stepIndex + 1}
      </div>
    );
  };

  const getStepTitle = (step: ProductStep) => {
    return translations.steps[step]?.title || step;
  };

  const getStepDescription = (step: ProductStep) => {
    return translations.steps[step]?.description || '';
  };

  const handleStepClick = (stepIndex: number) => {
    onStepClick(stepIndex);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{translations.progress.step} {currentStep + 1} {translations.progress.of} {steps.length}</span>
          <span>{completedSteps.size}/{steps.length} {translations.progress.complete}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-cb-red h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="p-6">
        <nav className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div key={step} className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div 
                    onClick={() => handleStepClick(index)}
                    className="cursor-pointer"
                  >
                    {getStepIcon(index, status)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div 
                    className={`
                      text-sm font-medium mb-1 transition-colors cursor-pointer
                      ${status === 'current' 
                        ? 'text-cb-red' 
                        : status === 'completed'
                        ? 'text-green-600'
                        : 'text-gray-900 hover:text-cb-red'
                      }
                    `}
                    onClick={() => handleStepClick(index)}
                  >
                    {getStepTitle(step)}
                  </div>
                  <p className={`
                    text-xs 
                    ${status === 'current' || status === 'completed' 
                      ? 'text-gray-600' 
                      : 'text-gray-400'
                    }
                  `}>
                    {getStepDescription(step)}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 ml-4">
                    <ChevronRight className={`
                      h-4 w-4 
                      ${status === 'completed' 
                        ? 'text-green-500' 
                        : status === 'current'
                        ? 'text-cb-red'
                        : 'text-gray-300'
                      }
                    `} />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default StepNavigation;