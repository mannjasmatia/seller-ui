// src/pages/products/components/EmptyState.tsx
import React from 'react';
import { Plus, Package } from 'lucide-react';
import Button from '../../../components/BasicComponents/Button';
import translations from '../translations.json';

interface EmptyStateProps {
  onAddProduct: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProduct }) => {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {translations.emptyState.title}
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        {translations.emptyState.description}
      </p>
      <Button
        variant="solid"
        onClick={onAddProduct}
        leftIcon={<Plus className="h-4 w-4" />}
        className="bg-cb-red hover:bg-cb-red/90"
      >
        {translations.emptyState.addFirstProduct}
      </Button>
    </div>
  );
};

export default EmptyState;