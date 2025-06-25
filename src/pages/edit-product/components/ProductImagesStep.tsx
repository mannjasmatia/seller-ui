// src/pages/edit-product/components/ProductImagesStep.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Undo2, Info, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { ProductImagesData, ValidationError } from '../types.edit-product';
import DynamicImage from '../../../components/BasicComponents/Image';
import Button from '../../../components/BasicComponents/Button';

interface ProductImagesStepProps {
  data: ProductImagesData; // Current images (existing + new file previews)
  originalImages: string[]; // Original images from backend
  newFiles: File[]; // New files to be uploaded
  validationErrors: ValidationError[];
  onUpdate: (data: { images: string[]; newFiles: File[] }) => void;
  translations: any;
}

const ProductImagesStep: React.FC<ProductImagesStepProps> = ({
  data = { images: [], newFiles: [], originalImages: [] },
  originalImages = [],
  newFiles = [],
  validationErrors = [],
  onUpdate,
  translations
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [showUndo, setShowUndo] = useState(false);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      filePreviewUrls?.forEach(url => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Check if changes were made compared to original
  useEffect(() => {
    const hasChanges = hasAnyChanges();
    setShowUndo(hasChanges);
  }, [data, newFiles, originalImages]);

  const getError = (field: string) => {
    return validationErrors?.find(error => error?.field === field)?.message;
  };

  // Check if we have at least one image (existing or new)
  const hasAtLeastOneImage = () => {
    const existingCount = data?.images?.filter(img => originalImages?.includes(img))?.length || 0;
    const newFilesCount = newFiles?.length || 0;
    return existingCount + newFilesCount >= 1;
  };

  // Get total image count
  const getTotalImageCount = () => {
    const existingCount = data?.images?.filter(img => originalImages?.includes(img))?.length || 0;
    const newFilesCount = newFiles?.length || 0;
    return existingCount + newFilesCount;
  };

  // Check if any changes were made
  const hasAnyChanges = () => {
    // Check if any original images were removed
    const removedImages = originalImages?.filter(img => !data?.images?.includes(img)) || [];
    // Check if new files were added
    const hasNewFiles = (newFiles?.length || 0) > 0;
    return removedImages.length > 0 || hasNewFiles;
  };

  // Get removed images count
  const getRemovedImagesCount = () => {
    return originalImages?.filter(img => !data?.images?.includes(img))?.length || 0;
  };

  // Get existing images that are kept
  const getKeptImages = () => {
    return data?.images?.filter(img => originalImages?.includes(img)) || [];
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files)?.filter(file => !validTypes?.includes(file?.type)) || [];
    
    if (invalidFiles?.length > 0) {
      alert(`Invalid file types detected. Please select only JPG, PNG, or WebP files.`);
      return;
    }

    // Check file sizes (max 5MB each)
    const oversizedFiles = Array.from(files)?.filter(file => file?.size > 5 * 1024 * 1024) || [];
    if (oversizedFiles?.length > 0) {
      alert(`Some files are too large. Maximum file size is 5MB.`);
      return;
    }

    // Check total count limit
    const currentTotal = getTotalImageCount();
    if (currentTotal + files.length > 10) {
      const canAdd = Math.max(0, 10 - currentTotal);
      alert(`Maximum 10 images allowed. You can add ${canAdd} more image${canAdd !== 1 ? 's' : ''}.`);
      return;
    }

    // Add new files
    const newFilesList = [...(newFiles || []), ...Array.from(files)];
    
    // Create preview URLs for new files
    const newPreviewUrls = [...(filePreviewUrls || [])];
    Array.from(files)?.forEach(file => {
      newPreviewUrls.push(URL.createObjectURL(file));
    });
    
    setFilePreviewUrls(newPreviewUrls);
    
    onUpdate({ 
      images: data.images || [], 
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
    handleFileSelect(e.dataTransfer?.files);
  };

  const removeExistingImage = (imageUrl: string) => {
    const newImages = data?.images?.filter(img => img !== imageUrl) || [];
    onUpdate({ 
      images: newImages, 
      newFiles: newFiles || [] 
    });
  };

  const removeNewFile = (index: number) => {
    const newFilesList = newFiles?.filter((_, i) => i !== index) || [];
    const newPreviewUrls = filePreviewUrls?.filter((_, i) => i !== index) || [];
    
    // Revoke the object URL to prevent memory leaks
    if (filePreviewUrls?.[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrls[index]);
    }
    
    setFilePreviewUrls(newPreviewUrls);
    onUpdate({ 
      images: data?.images || [], 
      newFiles: newFilesList 
    });
  };

  const handleUndo = () => {
    // Reset to original state
    onUpdate({
      images: [...(originalImages || [])],
      newFiles: []
    });
    
    // Clear preview URLs
    filePreviewUrls?.forEach(url => {
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setFilePreviewUrls([]);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Check if we can add more images
  const canAddMore = getTotalImageCount() < 10;
  const totalImages = getTotalImageCount();
  const keptImages = getKeptImages();
  const removedCount = getRemovedImagesCount();

  return (
    <div className="space-y-6">
      {/* Header Section with Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ImageIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
              <p className="text-sm text-gray-600">Manage your product images (minimum 1 required, maximum 10 allowed)</p>
            </div>
          </div>
          
          {showUndo && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              leftIcon={<Undo2 className="h-4 w-4" />}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Undo All Changes
            </Button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{totalImages}</div>
            <div className="text-xs text-gray-600">Total Images</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="text-2xl font-bold text-green-600">{keptImages?.length || 0}</div>
            <div className="text-xs text-gray-600">Existing Kept</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{newFiles?.length || 0}</div>
            <div className="text-xs text-gray-600">New to Upload</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-100">
            <div className="text-2xl font-bold text-red-600">{removedCount}</div>
            <div className="text-xs text-gray-600">Removed</div>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {!hasAtLeastOneImage() && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">At least one image is required</p>
              <p className="text-xs text-red-700 mt-1">Upload new images or keep existing ones to proceed</p>
            </div>
          </div>
        </div>
      )}

      {hasAnyChanges() && hasAtLeastOneImage() && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">You have unsaved image changes</p>
              <p className="text-xs text-yellow-700 mt-1">
                {removedCount > 0 && `${removedCount} image${removedCount !== 1 ? 's' : ''} will be removed`}
                {removedCount > 0 && (newFiles?.length || 0) > 0 && ', '}
                {(newFiles?.length || 0) > 0 && `${newFiles.length} new image${newFiles.length !== 1 ? 's' : ''} will be uploaded`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {canAddMore && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <div
            className={`
              p-8 text-center cursor-pointer transition-all duration-200
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragging ? 'Drop images here' : 'Upload Images'}
            </h3>
            <p className="text-gray-500 mb-2">
              Drag & drop images here or click to browse
            </p>
            <p className="text-sm text-gray-400 mb-3">
              Supported: JPG, PNG, WebP • Max 5MB each
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span>📁 {totalImages}/10 images</span>
              <span>•</span>
              <span>➕ {10 - totalImages} slots remaining</span>
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
        </div>
      )}

      {/* Image limit reached */}
      {!canAddMore && totalImages === 10 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Maximum of 10 images reached. Remove some images to add new ones.
            </p>
          </div>
        </div>
      )}

      {/* Existing Images Section */}
      {(keptImages?.length || 0) > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Existing Images ({keptImages.length})
              </h3>
            </div>
            <span className="text-sm text-gray-500">These images are already saved</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {keptImages?.map((imageUrl, index) => (
              <div key={`existing-${imageUrl}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                  <DynamicImage
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    objectFit="cover"
                    width="w-full"
                    height="h-full"
                    rounded="sm"
                  />
                </div>
                
                <Button
                  variant="solid"
                  size="xs"
                  onClick={() => removeExistingImage(imageUrl)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 shadow-lg"
                  ariaLabel="Remove existing image"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                  ✓ Saved
                </div>
              </div>
            )) || []}
          </div>
        </div>
      )}

      {/* New Images Section */}
      {(newFiles?.length || 0) > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                New Images to Upload ({newFiles.length})
              </h3>
            </div>
            <span className="text-sm text-gray-500">Will be uploaded when you save</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newFiles?.map((file, index) => (
              <div key={`new-${file.name}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-orange-200">
                  <DynamicImage
                    src={filePreviewUrls?.[index] || URL.createObjectURL(file)}
                    alt={`New image ${index + 1}`}
                    objectFit="cover"
                    width="w-full"
                    height="h-full"
                    rounded="sm"
                  />
                </div>
                
                <Button
                  variant="solid"
                  size="xs"
                  onClick={() => removeNewFile(index)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 shadow-lg"
                  ariaLabel="Remove new image"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow">
                  📤 To Upload
                </div>
                
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded shadow">
                  {((file?.size || 0) / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            )) || []}
          </div>
        </div>
      )}

      {/* Removed Images Info */}
      {removedCount > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center">
            <Trash2 className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {removedCount} image{removedCount !== 1 ? 's' : ''} will be removed when you save
              </p>
              <p className="text-xs text-red-700 mt-1">
                Click "Undo All Changes" to restore them
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalImages === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No images uploaded yet
          </h3>
          <p className="text-gray-500 mb-6">
            Upload your first image to get started. At least one image is required.
          </p>
          <Button
            variant="solid"
            onClick={openFileDialog}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Upload Your First Image
          </Button>
        </div>
      )}

      {/* General error display */}
      {getError('images') && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{getError('images')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImagesStep;