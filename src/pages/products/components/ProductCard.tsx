// src/pages/products/components/ProductCard.tsx
import React, { useState } from 'react';
import { Edit, Trash2, Star, Calendar, Package, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Button from '../../../components/BasicComponents/Button';
import DynamicImage from '../../../components/BasicComponents/Image';
import { Product } from '../types.products';

const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onCompleteNow: () => void;
  onClick: () => void;
  onDelete: () => void;
  translations: any;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onCompleteNow,
  onClick,
  onDelete,
  translations
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getStatusBadge = () => {
    if (product.isComplete) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complete
        </span>
      );
    } else if (product.completionPercentage >= 70) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Nearly Complete
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Incomplete
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageNavigation = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'next' && currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer h-48"
      onClick={onClick}
    >
      <div className="flex h-full">
        {/* Image Section - 40% width */}
        <div className="w-2/5 relative bg-gray-50">
          {product.images.length > 0 ? (
            <>
              <DynamicImage
                src={`${MEDIA_URL}/${product.images[currentImageIndex]}`}
                alt={product.name}
                objectFit="cover"
                width="w-full"
                height="h-full"
                className="transition-transform duration-300 hover:scale-105"
              />

              {/* Carousel Controls */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => handleImageNavigation('prev', e)}
                    className={`absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity ${
                      currentImageIndex === 0 ? 'cursor-not-allowed opacity-30' : ''
                    }`}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>

                  <button
                    onClick={(e) => handleImageNavigation('next', e)}
                    className={`absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity ${
                      currentImageIndex === product.images.length - 1 ? 'cursor-not-allowed opacity-30' : ''
                    }`}
                    disabled={currentImageIndex === product.images.length - 1}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleDotClick(index, e)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Counter */}
                  <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                    {currentImageIndex + 1}/{product.images.length}
                  </div>
                </>
              )}

              {/* Verification Badge */}
              {product.isVerified && (
                <div className="absolute top-1 left-1">
                  <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                    Verified
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">No image</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section - 60% width */}
        <div className="w-3/5 p-4 flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <div className="mt-1">
                  {getStatusBadge()}
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex-shrink-0">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - product.completionPercentage / 100)}`}
                      className={`transition-all duration-300 ${
                        product.completionPercentage >= 80 
                          ? 'text-green-500' 
                          : product.completionPercentage >= 50 
                          ? 'text-yellow-500' 
                          : 'text-red-500'
                      }`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {product.completionPercentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center">
                <Package className="h-3 w-3 mr-1" />
                {product.categoryName}
              </span>
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                {product.avgRating > 0 ? product.avgRating.toFixed(1) : 'New'}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(product.createdAt)}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">MOQ</p>
                <p className="text-sm font-medium">{product.moq}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery</p>
                <p className="text-sm font-medium">{product.deliveryDays}d</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Custom</p>
                <p className="text-sm font-medium">{product.isCustomizable ? '✓' : '○'}</p>
              </div>
            </div>

            {/* Price */}
            {(product.minPrice > 0 || product.maxPrice > 0) && (
              <div className="bg-gray-50 rounded px-2 py-1">
                <p className="text-xs text-gray-500">Price Range</p>
                <p className="text-sm font-semibold text-cb-red">
                  {product.minPrice > 0 && product.maxPrice > 0 && product.minPrice !== product.maxPrice 
                    ? `₹${product.minPrice.toLocaleString()} - ₹${product.maxPrice.toLocaleString()}`
                    : product.minPrice > 0 
                    ? `₹${product.minPrice.toLocaleString()}`
                    : `₹${product.maxPrice.toLocaleString()}`
                  }
                </p>
              </div>
            )}

            {/* Incomplete Steps */}
            {!product.isComplete && product.incompleteSteps.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                <p className="text-xs text-yellow-800 font-medium mb-1">Missing steps:</p>
                <div className="flex flex-wrap gap-1">
                  {product.incompleteSteps.slice(0, 3).map((step, index) => (
                    <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                      {step}
                    </span>
                  ))}
                  {product.incompleteSteps.length > 3 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                      +{product.incompleteSteps.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              {!product.isComplete ? (
                <Button
                  variant="solid"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteNow();
                  }}
                  leftIcon={<Play className="h-3 w-3" />}
                  className="bg-cb-red hover:bg-cb-red/90 text-white text-xs px-2 py-1"
                >
                  Complete
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  leftIcon={<Edit className="h-3 w-3" />}
                  className="border-gray-300 text-gray-700 hover:border-cb-red hover:text-cb-red text-xs px-2 py-1"
                >
                  Edit
                </Button>
              )}
            </div>

            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                leftIcon={<Trash2 className="h-3 w-3" />}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs px-2 py-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;