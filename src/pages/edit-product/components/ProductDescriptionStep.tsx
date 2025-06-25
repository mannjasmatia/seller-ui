// src/pages/EditProduct/components/ProductDescriptionStep.tsx
import React, { useRef, useState } from "react";
import { Plus, X, FileText, Upload, Image as ImageIcon } from "lucide-react";
import {
  ProductDescription,
  ProductDescriptionAttribute,
  ValidationError,
} from "../types.edit-product";
import Button from "../../../components/BasicComponents/Button";
import Input from "../../../components/BasicComponents/Input";
import DynamicImage from "../../../components/BasicComponents/Image";

interface ProductDescriptionStepProps {
  data: ProductDescription;
  validationErrors: ValidationError[];
  onUpdate: (data: Partial<ProductDescription>) => void;
  onUploadImages: (files: FileList) => Promise<boolean>;
  translations: any;
}

const ProductDescriptionStep: React.FC<ProductDescriptionStepProps> = ({
  data,
  validationErrors,
  onUpdate,
  onUploadImages,
  translations,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getError = (field: string) => {
    return validationErrors.find((error) => error.field === field)?.message;
  };

  // Description Points Functions
  const addPoint = () => {
    onUpdate({ points: [...data.points, ""] });
  };

  const removePoint = (index: number) => {
    const newPoints = data.points.filter((_, i) => i !== index);
    onUpdate({ points: newPoints });
  };

  const updatePoint = (index: number, value: string) => {
    // Validate length before updating
    if (value.length > 500) {
      return; // Don't update if exceeding limit
    }

    const newPoints = [...data.points];
    newPoints[index] = value;
    onUpdate({ points: newPoints });
  };

  // Attributes Functions
  const addAttribute = () => {
    const newAttribute: ProductDescriptionAttribute = { field: "", value: "" };
    onUpdate({ attributes: [...data.attributes, newAttribute] });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = data.attributes.filter((_, i) => i !== index);
    onUpdate({ attributes: newAttributes });
  };

  const updateAttribute = (
    index: number,
    field: "field" | "value",
    value: string
  ) => {
    // Validate lengths based on field type
    const maxLength = field === "field" ? 100 : 500;
    if (value.length > maxLength) {
      return; // Don't update if exceeding limit
    }

    const newAttributes = [...data.attributes];
    newAttributes[index][field] = value;
    onUpdate({ attributes: newAttributes });
  };

  // Image Functions
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = Array.from(files).filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert("Please select only JPG, PNG, or WebP files.");
      return;
    }

    setIsUploading(true);
    const success = await onUploadImages(files);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    const newImages = data.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8">
      {/* Description Points */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-cb-red mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {translations.description.points}
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addPoint}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.description.addPoint}
          </Button>
        </div>

        {data.points.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {translations.description.noPoints}
            </h4>
            <p className="text-gray-500">
              {translations.description.addFirstPoint}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.points.map((point, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Point {index + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => removePoint(index)}
                    ariaLabel={translations.description.removePoint}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <Input
                  type="textarea"
                  placeholder={translations.description.pointPlaceholder}
                  value={point}
                  onChange={(value) => updatePoint(index, value)}
                  rows={3}
                  fullWidth
                  validation={{
                    required: true,
                    minLength: 1,
                    maxLength: 500,
                    errorMessages: {
                      required: "Description point is required",
                      minLength: "Description point cannot be empty",
                      maxLength: "Each point must be at most 500 characters",
                    },
                  }}
                  error={getError(`description.points.${index}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Attributes */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {translations.description.attributes}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addAttribute}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {translations.description.addAttribute}
          </Button>
        </div>

        {data.attributes.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {translations.description.noAttributes}
            </h4>
            <p className="text-gray-500">
              {translations.description.addFirstAttribute}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.attributes.map((attribute, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Attribute {index + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => removeAttribute(index)}
                    leftIcon={<X className="h-3 w-3" />}
                    ariaLabel={translations.description.removeAttribute}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    label={translations.description.attributeField}
                    placeholder={
                      translations.description.attributeFieldPlaceholder
                    }
                    value={attribute.field}
                    onChange={(value) => updateAttribute(index, "field", value)}
                    fullWidth
                    validation={{
                      required: true,
                      maxLength: 100,
                      errorMessages: {
                        required: "Attribute field is required",
                        maxLength:
                          "Attribute field must be at most 100 characters",
                      },
                    }}
                    error={getError(`description.attributes.${index}.field`)}
                  />

                  <Input
                    type="text"
                    label={translations.description.attributeValue}
                    placeholder={
                      translations.description.attributeValuePlaceholder
                    }
                    value={attribute.value}
                    onChange={(value) => updateAttribute(index, "value", value)}
                    fullWidth
                    validation={{
                      required: true,
                      maxLength: 500,
                      errorMessages: {
                        required: "Attribute value is required",
                        maxLength:
                          "Attribute value must be at most 500 characters",
                      },
                    }}
                    error={getError(`description.attributes.${index}.value`)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description Images */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <ImageIcon className="h-5 w-5 text-cb-red mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            {translations.description.images}
          </h3>
        </div>

        {/* Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mb-6
            ${
              isDragging
                ? "border-cb-red bg-red-50"
                : "border-gray-300 hover:border-cb-red hover:bg-gray-50"
            }
            ${isUploading ? "opacity-50 pointer-events-none" : ""}
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
            {translations.description.uploadImages}
          </h4>
          <p className="text-gray-500 mb-2">
            {translations.description.dragAndDrop}
          </p>
          <p className="text-sm text-gray-400">
            {translations.description.supportedFormats}
          </p>

          {isUploading && (
            <div className="mt-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cb-red mx-auto"></div>
            </div>
          )}

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
        {data.images.length > 0 ? (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              {translations.description.currentImages} ({data.images.length})
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.images.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="h-[200px] w-full flex rounded-2xl items-center justify-center p-2 pb-0">
                    <div className="w-[90%] h-full rounded-2xl flex items-center justify-center overflow-hidden">
                      <DynamicImage
                        src={imageUrl}
                        alt={`Description image ${index + 1}`}
                        objectFit="cover"
                        width="w-full"
                        height="h-full"
                        className="min-h-[160px] min-w-[160px]"
                        rounded="lg"
                      />
                    </div>
                  </div>

                  <Button
                    variant="solid"
                    size="xs"
                    onClick={() => removeImage(index)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                    leftIcon={<X className="h-3 w-3" />}
                    ariaLabel={translations.description.removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {translations.description.noImages}
            </h4>
            <p className="text-gray-500">
              {translations.description.uploadFirstImage}
            </p>
          </div>
        )}
      </div>

      {getError("description") && (
        <p className="text-sm text-red-600">{getError("description")}</p>
      )}
    </div>
  );
};

export default ProductDescriptionStep;
