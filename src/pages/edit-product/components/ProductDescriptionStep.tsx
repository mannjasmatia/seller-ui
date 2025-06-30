// src/pages/edit-product/components/ProductDescriptionStep.tsx
import React, { useRef, useState } from "react";
import { Plus, X, FileText, Upload, Image as ImageIcon, AlertCircle, Eye } from "lucide-react";
import {
  ProductDescription,
  ProductDescriptionAttribute,
  ValidationError,
} from "../types.edit-product";
import Button from "../../../components/BasicComponents/Button";
import Input from "../../../components/BasicComponents/Input";
import DynamicImage from "../../../components/BasicComponents/Image";
import ConfirmationModal from "../../../modals/ConfirmationModal";
import MediaModal from "../../../modals/MediaModal";
import { MediaFile } from "../../../components/BasicComponents/types";

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

interface ProductDescriptionStepProps {
  data: ProductDescription;
  validationErrors: ValidationError[];
  onUpdate: (data: ProductDescription) => void;
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

const ProductDescriptionStep: React.FC<ProductDescriptionStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  onUpload,
  onRemove,
  translations,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Modal states for images
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; isNewFile: boolean } | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<MediaFile[]>([]);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);

  const getError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
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

  // Description Points Functions
  const addPoint = () => {
    if (data.points.length >= 10) {
      alert(translations.validation?.maxPoints?.replace('{max}', '10') || 'Maximum 10 points allowed');
      return;
    }
    onUpdate({ ...data, points: [...data.points, ""] });
  };

  const removePoint = (index: number) => {
    if (data.points.length <= 1) {
      alert(translations.validation?.minPoints?.replace('{min}', '1') || 'At least 1 point is required');
      return;
    }
    const newPoints = data.points.filter((_, i) => i !== index);
    onUpdate({ ...data, points: newPoints });
  };

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...data.points];
    newPoints[index] = value;
    onUpdate({ ...data, points: newPoints });
  };

  // Attributes Functions
  const addAttribute = () => {
    if (data.attributes.length >= 20) {
      alert(translations.validation?.maxAttributes?.replace('{max}', '20') || 'Maximum 20 attributes allowed');
      return;
    }
    const newAttribute: ProductDescriptionAttribute = { field: "", value: "" };
    onUpdate({ ...data, attributes: [...data.attributes, newAttribute] });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = data.attributes.filter((_, i) => i !== index);
    onUpdate({ ...data, attributes: newAttributes });
  };

  const updateAttribute = (
    index: number,
    field: "field" | "value",
    value: string
  ) => {
    const newAttributes = [...data.attributes];
    newAttributes[index][field] = value;
    onUpdate({ ...data, attributes: newAttributes });
  };

  // Image Functions (Following ProductImagesStep Pattern)
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = Array.from(files).filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(translations.description?.images?.invalidFileType || 'Please select only JPG, PNG, or WebP files.');
      return;
    }

    // Check total number of images
    if (totalImageCount + files.length > 10) {
      alert(translations.description?.images?.maxImagesExceeded || 'Maximum 10 images allowed');
      return;
    }

    // Validate file sizes (5MB per file)
    const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(translations.description?.images?.fileSizeExceeded || 'Each file must be less than 5MB');
      return;
    }

    // Store files temporarily in newFiles array (DON'T upload immediately)
    const currentNewFiles = data.newFiles || [];
    const newFiles = [...currentNewFiles, ...Array.from(files)];
    
    onUpdate({
      ...data,
      newFiles
    });

    // Clear the file input
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
      alt: `Description image ${((clickedIndex + index) % allItems.length) + 1}`,
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
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {translations.description?.images?.noImages || 'No description images added yet'}
          </h4>
          <p className="text-gray-500 mb-4">
            {translations.description?.images?.addFirst || 'Add images to provide more details about your product'}
          </p>
          <Button
            variant="solid"
            onClick={openFileDialog}
            leftIcon={<Upload className="h-4 w-4" />}
            theme={['cb-red', 'white']}
          >
            {translations.description?.images?.uploadImages || 'Upload Images'}
          </Button>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">
            {translations.description?.images?.currentImages || 'Description Images'} ({totalImageCount}/10)
          </h4>
          {totalImageCount >= 10 && (
            <p className="text-sm text-yellow-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {translations.description?.images?.maxLimitReached || 'Maximum limit reached'}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allItems.map((item, globalIndex) => {
            const isNewFile = item.type === 'new';
            const imageUrl = isNewFile
              ? getPreviewUrl(item.file!)
              : `${MEDIA_URL}/${item.url}`;

            return (
              <div key={`${item.type}-${globalIndex}`} className="group relative">
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => initiateDelete(item.index, isNewFile)}
                  className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                  aria-label={translations.description?.images?.deleteImage || 'Delete image'}
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-cb-red transition-colors duration-300">
                  <div className="absolute inset-0">
                    <DynamicImage
                      src={imageUrl}
                      alt={`Description image ${globalIndex + 1}`}
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
                      {translations.description?.images?.newFileLabel || 'New'}
                    </div>
                  )}

                  {/* Image index indicator */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {globalIndex + 1}
                  </div>

                  {/* Hover overlay */}
                  <div onClick={() => handleImageClick(globalIndex)} className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center cursor-pointer">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-6 w-6 text-white drop-shadow-lg" />
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
      {/* Description Points */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.description?.points || 'Description Points'}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addPoint}
            leftIcon={<Plus className="h-4 w-4" />}
            theme={['cb-red', 'white']}
            disabled={data.points.length >= 10}
          >
            {translations.description?.addPoint || 'Add Point'}
          </Button>
        </div>

        {data.points.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {translations.description?.noPoints || 'No description points added yet'}
            </h4>
            <p className="text-gray-500 mb-4">
              {translations.description?.addFirstPoint || 'Add key points to describe your product'}
            </p>
            <Button
              variant="solid"
              onClick={addPoint}
              leftIcon={<Plus className="h-4 w-4" />}
              theme={['cb-red', 'white']}
            >
              {translations.description?.addPoint || 'Add Point'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.points.map((point, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-1">
                  <Input
                    type="textarea"
                    rows={2}
                    placeholder={translations.description?.pointPlaceholder || 'Enter description point...'}
                    value={point}
                    onChange={(value) => updatePoint(index, value)}
                    fullWidth
                    validation={{
                      required: true,
                      maxLength: 500,
                      errorMessages: {
                        required: "Description point is required",
                        maxLength: "Description point must be at most 500 characters",
                      },
                    }}
                    error={getError(`description.points.${index}`)}
                    theme={['cb-red', 'white']}
                  />
                </div>
                {data.points.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePoint(index)}
                    leftIcon={<X className="h-4 w-4" />}
                    theme={['cb-red', 'white']}
                    className="shrink-0 mt-1"
                  >
                    {translations.description?.removePoint || 'Remove'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {getError('description.points') && (
          <p className="text-sm text-red-600 flex items-center mt-4">
            <AlertCircle className="h-4 w-4 mr-1" />
            {getError('description.points')}
          </p>
        )}
      </div>

      {/* Additional Attributes */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {translations.description?.attributes || 'Additional Attributes'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addAttribute}
            leftIcon={<Plus className="h-4 w-4" />}
            theme={['cb-red', 'white']}
            disabled={data.attributes.length >= 20}
          >
            {translations.description?.addAttribute || 'Add Attribute'}
          </Button>
        </div>

        {data.attributes.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">
              {translations.description?.noAttributes || 'No additional attributes added yet'}
            </p>
            <Button
              variant="outline"
              onClick={addAttribute}
              leftIcon={<Plus className="h-4 w-4" />}
              theme={['cb-red', 'white']}
            >
              {translations.description?.addAttribute || 'Add Attribute'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.attributes.map((attribute, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {translations.description?.fieldLabel || 'Field Name'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    placeholder={translations.description?.fieldPlaceholder || 'e.g., Material, Dimensions, Weight'}
                    value={attribute.field}
                    onChange={(value) => updateAttribute(index, "field", value)}
                    fullWidth
                    validation={{
                      required: true,
                      maxLength: 50,
                      errorMessages: {
                        required: "Attribute field is required",
                        maxLength: "Attribute field must be at most 50 characters",
                      },
                    }}
                    error={getError(`description.attributes.${index}.field`)}
                    theme={['cb-red', 'white']}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {translations.description?.valueLabel || 'Value'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(index)}
                      leftIcon={<X className="h-4 w-4" />}
                      theme={['cb-red', 'white']}
                      className="shrink-0"
                    >
                      {translations.description?.removeAttribute || 'Remove'}
                    </Button>
                  </div>
                  <Input
                    placeholder={translations.description?.valuePlaceholder || 'Enter value...'}
                    value={attribute.value}
                    onChange={(value) => updateAttribute(index, "value", value)}
                    fullWidth
                    validation={{
                      required: true,
                      maxLength: 500,
                      errorMessages: {
                        required: "Attribute value is required",
                        maxLength: "Attribute value must be at most 500 characters",
                      },
                    }}
                    error={getError(`description.attributes.${index}.value`)}
                    theme={['cb-red', 'white']}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description Images */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ImageIcon className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.description?.images?.title || 'Description Images'}
            </h3>
            <span className="ml-2 text-sm text-gray-500">
              ({translations.general?.optional || 'Optional'})
            </span>
          </div>
          
          {/* {canUploadMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              leftIcon={<Plus className="h-4 w-4" />}
              theme={['cb-red', 'white']}
            >
              {translations.description?.images?.addImages || 'Add Images'}
            </Button>
          )} */}
        </div>

        {/* Upload Area */}
        {canUploadMore && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mb-6
              ${
                isDragging
                  ? "border-cb-red bg-red-50"
                  : "border-gray-300 hover:border-cb-red hover:bg-gray-50"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <Upload
              className={`h-8 w-8 mb-3 mx-auto ${
                isDragging ? "text-cb-red" : "text-gray-400"
              }`}
            />
            <h4 className="text-md font-medium text-gray-900 mb-1">
              {translations.description?.images?.uploadImages || 'Upload Description Images'}
            </h4>
            <p className="text-gray-500 mb-2">
              {translations.description?.images?.dragAndDrop || 'Drag & drop images here or click to browse'}
            </p>
            <p className="text-sm text-gray-400">
              {translations.description?.images?.supportedFormats || 'Supported: JPG, PNG, WebP (Max 10 images, 5MB each)'}
            </p>

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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  {translations.description?.images?.newFilesNotice?.title?.replace('{count}', data.newFiles.length.toString()) || 
                   `${data.newFiles.length} new file(s) ready to upload`}
                </h4>
                <p className="text-sm text-blue-800">
                  {translations.description?.images?.newFilesNotice?.description || 
                   'These files will be uploaded when you save this step. You can remove them before saving if needed.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {translations.description?.images?.guidelines?.title || 'Description Image Guidelines'}
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {translations.description?.images?.guidelines?.purpose || 'Use images to show product details, features, or usage scenarios'}</li>
            <li>• {translations.description?.images?.guidelines?.quality || 'Use high-quality images (minimum 800x600 pixels)'}</li>
            <li>• {translations.description?.images?.guidelines?.formats || 'Supported formats: JPG, PNG, WebP'}</li>
            <li>• {translations.description?.images?.guidelines?.fileSize || 'Maximum file size: 5MB per image'}</li>
            <li>• {translations.description?.images?.guidelines?.maxCount || 'Maximum 10 images per description'}</li>
            <li>• {translations.description?.images?.guidelines?.optional || 'Description images are optional but help customers understand your product better'}</li>
          </ul>
        </div>

        {getError('description.images') && (
          <p className="text-sm text-red-600 flex items-center mt-4">
            <AlertCircle className="h-4 w-4 mr-1" />
            {getError('description.images')}
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteModal}
        title={translations.description?.images?.deleteModal?.title || 'Delete Description Image'}
        description={translations.description?.images?.deleteModal?.description || 'Are you sure you want to delete this description image? This action cannot be undone.'}
        confirmButtonText={translations.description?.images?.deleteModal?.confirmText || 'Delete'}
        cancelButtonText={translations.description?.images?.deleteModal?.cancelText || 'Cancel'}
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
        title={translations.description?.images?.mediaModal?.title || 'Description Images'}
        download={true}
        downloadText={translations.description?.images?.mediaModal?.downloadText || 'Download'}
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

export default ProductDescriptionStep;