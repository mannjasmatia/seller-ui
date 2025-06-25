// src/pages/edit-product/components/ProductImagesStep.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ValidationError } from '../types.edit-product';
import DynamicImage from '../../../components/BasicComponents/Image';
import Button from '../../../components/BasicComponents/Button';

interface ProductImagesStepProps {
  data: string[]; // Current images (existing + new file previews)
  originalImages: string[]; // Original images from backend
  newFiles: File[]; // New files to be uploaded
  validationErrors: ValidationError[];
  onUpdate: (data: { images: string[]; newFiles: File[] }) => void;
  translations: any;
}

const ProductImagesStep: React.FC<ProductImagesStepProps> = ({
  data,
  originalImages,
  newFiles,
  validationErrors,
  onUpdate,
  translations
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  // Check if we have at least one image (existing or new)
  const hasAtLeastOneImage = () => {
    const existingImagesCount = data?.filter(img => originalImages?.includes(img))?.length;
    const newFilesCount = newFiles?.length;
    return existingImagesCount + newFilesCount >= 1;
  };

  // Get total image count
  const getTotalImageCount = () => {
    const existingImagesCount = data?.filter(img => originalImages?.includes(img))?.length;
    return existingImagesCount + newFiles?.length;
  };

  // Check if changes were made
  const hasChanges = () => {
    // Check if any original images were removed
    const removedImages = originalImages?.filter(img => !data?.includes(img));
    // Check if new files were added
    return removedImages?.length > 0 || newFiles?.length > 0;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files?.length === 0) return;
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files)?.filter(file => !validTypes?.includes(file.type));
    
    if (invalidFiles?.length > 0) {
      alert('Please select only JPG, PNG, or WebP files.');
      return;
    }

    // Check total count limit (existing + new + about to add)
    const currentTotal = getTotalImageCount();
    if (currentTotal + files?.length > 10) {
      alert(`Maximum 10 images allowed. You can add ${10 - currentTotal} more.`);
      return;
    }

    // Add new files
    const newFilesList = [...newFiles, ...Array.from(files)];
    
    // Create preview URLs for new files
    const newPreviewUrls = [...filePreviewUrls];
    Array.from(files)?.forEach(file => {
      newPreviewUrls.push(URL.createObjectURL(file));
    });
    
    setFilePreviewUrls(newPreviewUrls);
    
    onUpdate({ 
      images: data, 
      newFiles: newFilesList 
    });
    
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

  const removeExistingImage = (index: number) => {
    const imageToRemove = data[index];
    const newImages = data?.filter((_, i) => i !== index);
    
    onUpdate({ 
      images: newImages, 
      newFiles 
    });
  };

  const removeNewFile = (index: number) => {
    const newFilesList = newFiles?.filter((_, i) => i !== index);
    const newPreviewUrls = filePreviewUrls?.filter((_, i) => i !== index);
    
    // Revoke the object URL to prevent memory leaks
    if (filePreviewUrls[index]) {
      URL.revokeObjectURL(filePreviewUrls[index]);
    }
    
    setFilePreviewUrls(newPreviewUrls);
    onUpdate({ 
      images: data, 
      newFiles: newFilesList 
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Check if we can add more images
  const canAddMore = getTotalImageCount() < 10;
  const totalImages = getTotalImageCount();

  return (
    <div className="space-y-8">
      {/* Upload Area - only show if we can add more */}
      {canAddMore && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging 
              ? 'border-cb-red bg-red-50' 
              : 'border-gray-300 hover:border-cb-red hover:bg-gray-50'
            }
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
            <p className="text-sm text-gray-600 mt-2">
              {totalImages}/10 images uploaded
            </p>
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
      )}

      {/* Validation Error */}
      {!hasAtLeastOneImage() && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">
              You need to upload at least one image
            </p>
          </div>
        </div>
      )}

      {/* Current Images */}
      {data.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {translations.images.currentImages} ({data.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
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
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                  ariaLabel={translations.images.removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {/* Badge to show if it's an existing or new image */}
                {originalImages?.includes(imageUrl) ? (
                  <div className="absolute bottom-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Saved
                  </div>
                ) : (
                  <div className="absolute bottom-4 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    New
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Files Preview */}
      {newFiles && Array.isArray(newFiles) && newFiles?.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            New Images to Upload ({newFiles.length})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative group">
                <div className="h-[240px] w-full flex rounded-2xl items-center justify-center p-2 pb-0">
                  <div className="w-[90%] h-full rounded-2xl flex items-center justify-center overflow-hidden">
                    <DynamicImage
                      src={filePreviewUrls[index] || URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
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
                  onClick={() => removeNewFile(index)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                  ariaLabel="Remove new image"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="absolute bottom-4 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  To Upload
                </div>
                
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data?.length === 0 && newFiles?.length === 0 && (
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

      {/* Image limit reached message */}
      {!canAddMore && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Maximum of 10 images reached. Remove some images to add new ones.
            </p>
          </div>
        </div>
      )}

      {/* Changes indicator */}
      {hasChanges() && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">
              You have unsaved image changes. Click "Save" to apply them.
            </p>
          </div>
        </div>
      )}

      {getError('images') && (
        <p className="text-sm text-red-600">{getError('images')}</p>
      )}
    </div>
  );
};

export default ProductImagesStep;