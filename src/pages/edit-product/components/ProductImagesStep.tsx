// src/pages/edit-product/components/ProductImagesStep.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Eye } from 'lucide-react';
import { ValidationError, ProductImagesData } from '../types.edit-product';
import DynamicImage from '../../../components/BasicComponents/Image';
import Button from '../../../components/BasicComponents/Button';
import ConfirmationModal from '../../../modals/ConfirmationModal';
import MediaModal from '../../../modals/MediaModal';
import { MediaFile } from '../../../components/BasicComponents/types';

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

interface ProductImagesStepProps {
  data: ProductImagesData;
  validationErrors: ValidationError[];
  onUpdate: (data: ProductImagesData) => void;
  onUpload: (files: FileList) => Promise<boolean>;
  onRemove: (index: number) => void;
  translations: any;
}

interface ImageItem {
  type: 'existing' | 'new';
  url?: string;
  file?: File;
  index: number;
}

const ProductImagesStep: React.FC<ProductImagesStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  onUpload,
  onRemove,
  translations
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; isNewFile: boolean } | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<MediaFile[]>([]);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);

  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  // Get total count of images (existing + new files)
  const totalImageCount = (data?.images?.length || 0) + (data?.newFiles?.length || 0);
  const canUploadMore = totalImageCount < 10;

  // Create all items array for consistent handling
  const getAllItems = (): ImageItem[] => {
    const existingImages = data?.images || [];
    const newFiles = data?.newFiles || [];
    
    return [
      ...existingImages.map((url, index) => ({ type: 'existing' as const, url, index })),
      ...newFiles.map((file, index) => ({ type: 'new' as const, file, index }))
    ];
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert(translations.images?.invalidFileType || 'Please select only JPG, PNG, or WebP files.');
      return;
    }

    // Check total number of images
    if (totalImageCount + files.length > 10) {
      alert(translations.images?.maxImagesExceeded || 'Maximum 10 images allowed');
      return;
    }

    // Validate file sizes (5MB per file)
    const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(translations.images?.fileSizeExceeded || 'Each file must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const success = await onUpload(files);
      if (!success) {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const initiateDelete = (index: number, isNewFile: boolean) => {
    setDeleteTarget({ index, isNewFile });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    const { index, isNewFile } = deleteTarget;
    
    if (isNewFile) {
      // Remove from newFiles array
      const newFiles = [...(data.newFiles || [])];
      newFiles.splice(index, 1);
      onUpdate({
        ...data,
        newFiles
      });
    } else {
      // Remove from existing images
      onRemove(index);
    }
    
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Create preview URLs for new files
  const getPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Handle image click for media modal
  const handleImageClick = (clickedIndex: number) => {
    const allItems = getAllItems();
    
    // Create cyclic array starting from clicked image
    const cyclicUrls: string[] = [];
    
    for (let i = 0; i < allItems.length; i++) {
      const actualIndex = (clickedIndex + i) % allItems.length;
      const item = allItems[actualIndex];
      
      if (item.type === 'existing') {
        cyclicUrls.push(`${MEDIA_URL}/${item.url}`);
      } else if (item.file) {
        cyclicUrls.push(getPreviewUrl(item.file));
      }
    }

    // Convert to MediaFile format
    const mediaFiles: MediaFile[] = cyclicUrls.map((url, index) => ({
      src: url,
      type: 'image',
      alt: `Product image ${((clickedIndex + index) % allItems.length) + 1}`,
      title: `Image ${((clickedIndex + index) % allItems.length) + 1}`,
    }));
    
    setMediaUrls(mediaFiles);
    setInitialMediaIndex(0); // Always start with the clicked image (which is now at index 0)
    setShowMediaModal(true);
  };

  const renderImageGrid = () => {
    const allItems = getAllItems();

    if (allItems.length === 0) {
      return (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {translations.images?.noImages || 'No images uploaded yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {translations.images?.uploadFirst || 'Upload your first image to get started'}
          </p>
          <Button
            variant="solid"
            onClick={openFileDialog}
            leftIcon={<Upload className="h-4 w-4" />}
            disabled={isUploading}
          >
            {translations.images?.uploadImages || 'Upload Images'}
          </Button>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {translations.images?.currentImages || 'Images'} ({totalImageCount}/10)
          </h3>
          {totalImageCount >= 10 && (
            <p className="text-sm text-yellow-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {translations.images?.maxLimitReached || 'Maximum limit reached'}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allItems.map((item, globalIndex) => {
            const isNewFile = item.type === 'new';
            const imageUrl = isNewFile
              ? getPreviewUrl((item as { file: File }).file)
              : (item as { url: string }).url;
            const actualIndex = item.index;
            
            return (
              <div key={`${item.type}-${actualIndex}-${globalIndex}`} className="w-full relative group">
                  {/* Delete Button - Top Right Corner */}
                  <div className="w-full relative flex items-end justify-end">
                  <Button
                    variant="solid"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      initiateDelete(actualIndex, isNewFile);
                    }}
                    className="absolute !px-2 !py-2 !top-3 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    ariaLabel={translations.images?.removeImage || 'Remove Image'}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  </div>
                <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-cb-red transition-colors">
                  
                  {/* Image */}
                  <div 
                    className="w-full h-full cursor-pointer"
                    onClick={() => handleImageClick(globalIndex)}
                  >
                    <DynamicImage
                      key={`${item.type}-${actualIndex}`}
                      src={!isNewFile ? `${MEDIA_URL}/${imageUrl}` : imageUrl}
                      alt={`Product image ${globalIndex + 1}`}
                      objectFit="cover"
                      width="w-full"
                      height="h-full"
                      className="transition-transform duration-300 group-hover:scale-105"
                      rounded="lg"
                    />
                  </div>
                  
                  {/* New file indicator */}
                  {isNewFile && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                      {translations.images?.newFileLabel || 'New'}
                    </div>
                  )}

                  {/* Image index indicator */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {globalIndex + 1}
                  </div>

                  {/* Hover overlay */}
                  <div onClick={() => handleImageClick(globalIndex) } className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Upload Area */}
      {canUploadMore && (
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
              {translations.images?.uploadImages || 'Upload Images'}
            </h3>
            <p className="text-gray-500 mb-4">
              {translations.images?.dragAndDrop || 'Drag & drop images here or click to browse'}
            </p>
            <p className="text-sm text-gray-400">
              {translations.images?.supportedFormats || 'Supported: JPG, PNG, WebP (Max 10 images, 5MB each)'}
            </p>
            
            {isUploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cb-red"></div>
                <p className="text-sm text-gray-600 mt-2">
                  {translations.images?.uploadingMessage || 'Adding images...'}
                </p>
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
      )}

      {/* Images Grid */}
      {renderImageGrid()}

      {/* New Files Notice */}
      {data?.newFiles && data.newFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {translations.images?.newFilesNotice?.title?.replace('{count}', data.newFiles.length.toString()) || 
                 `${data.newFiles.length} new file(s) ready to upload`}
              </h4>
              <p className="text-sm text-blue-800">
                {translations.images?.newFilesNotice?.description || 
                 'These files will be uploaded when you save this step. You can remove them before saving if needed.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          {translations.images?.guidelines?.title || 'Image Guidelines'}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {translations.images?.guidelines?.quality || 'Use high-quality images (minimum 800x600 pixels)'}</li>
          <li>• {translations.images?.guidelines?.angles || 'Show different angles and details of your product'}</li>
          <li>• {translations.images?.guidelines?.mainImage || 'First image will be used as the main product image'}</li>
          <li>• {translations.images?.guidelines?.formats || 'Supported formats: JPG, PNG, WebP'}</li>
          <li>• {translations.images?.guidelines?.fileSize || 'Maximum file size: 5MB per image'}</li>
          <li>• {translations.images?.guidelines?.maxCount || 'Maximum 10 images per product'}</li>
        </ul>
      </div>

      {getError('images') && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {getError('images')}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        title={translations.images?.deleteModal?.title || 'Delete Image'}
        description={translations.images?.deleteModal?.description || 'Are you sure you want to delete this image? This action cannot be undone.'}
        confirmButtonText={translations.images?.deleteModal?.confirmText || 'Delete'}
        cancelButtonText={translations.images?.deleteModal?.cancelText || 'Cancel'}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        theme={['cb-red', 'white']}
      />

      {/* Media Modal for Image Viewing */}
      <MediaModal
        open={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        files={mediaUrls}
        initialIndex={initialMediaIndex}
        title={translations.images?.mediaModal?.title || 'Product Images'}
        download={true}
        downloadText={translations.images?.mediaModal?.downloadText || 'Download'}
        closeOnClickOutside={true}
        closeOnEscape={true}
        height="88dvh"
        width="80dvw"
        animation="fade"
        objectFit="contain"
      />
    </div>
  );
};

export default ProductImagesStep;