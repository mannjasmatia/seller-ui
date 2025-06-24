// src/pages/EditProduct/components/ProductImagesStep.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ValidationError } from '../types.edit-product';
import DynamicImage from '../../../components/BasicComponents/Image';
import Button from '../../../components/BasicComponents/Button';

interface ProductImagesStepProps {
  data: string[];
  validationErrors: ValidationError[];
  onUpdate: (data: string[]) => void;
  onUpload: (files: FileList) => Promise<boolean>;
  translations: any;
}

const ProductImagesStep: React.FC<ProductImagesStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  onUpload,
  translations
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Please select only JPG, PNG, or WebP files.');
      return;
    }

    // Check total number of images
    if (data.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setIsUploading(true);
    const success = await onUpload(files);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = data.filter((_, i) => i !== index);
    onUpdate(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-cb-red bg-red-50' 
            : 'border-gray-300 hover:border-cb-red hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${isDragging ? 'text-cb-red' : 'text-gray-400'}`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {translations.images.uploadImages}
          </h3>
          <p className="text-gray-500 mb-4">
            {translations.images.dragAndDrop}
          </p>
          <p className="text-sm text-gray-400">
            {translations.images.supportedFormats}
          </p>
          
          {isUploading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cb-red"></div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Current Images */}
      {data.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {translations.images.currentImages} ({data.length}/10)
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="h-[240px] w-full flex rounded-2xl items-center justify-center p-2 pb-0">
                  <div className="w-[90%] h-full rounded-2xl flex items-center justify-center overflow-hidden">
                    <DynamicImage
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      objectFit="cover"
                      width="w-full"
                      height="h-full"
                      className="min-h-[200px] min-w-[200px]"
                      rounded="lg"
                    />
                  </div>
                </div>
                
                <Button
                  variant="solid"
                  size="xs"
                  onClick={() => removeImage(index)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                  ariaLabel={translations.images.removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {translations.images.noImages}
          </h3>
          <p className="text-gray-500">
            {translations.images.uploadFirst}
          </p>
        </div>
      )}

      {getError('images') && (
        <p className="text-sm text-red-600">{getError('images')}</p>
      )}
    </div>
  );
};

export default ProductImagesStep;