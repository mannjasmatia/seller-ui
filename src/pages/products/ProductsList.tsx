// src/pages/products/ProductsList.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import DynamicImage from '../../components/BasicComponents/Image';
import translations from '../AddEditProduct/translations.json';

// Mock data - replace with actual API call
const mockProducts = [
  {
    _id: '1',
    name: 'Premium Steel Pipes',
    slug: 'premium-steel-pipes',
    images: ['/api/placeholder/300/200'],
    completionPercentage: 85,
    incompleteSteps: ['description'],
    isComplete: false,
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Industrial Materials'
  },
  {
    _id: '2', 
    name: 'Aluminum Sheets',
    slug: 'aluminum-sheets',
    images: ['/api/placeholder/300/200'],
    completionPercentage: 100,
    incompleteSteps: [],
    isComplete: true,
    createdAt: '2024-01-10T08:15:00Z',
    category: 'Metal Products'
  },
  {
    _id: '3',
    name: 'Copper Wire Cables',
    slug: 'copper-wire-cables', 
    images: [],
    completionPercentage: 45,
    incompleteSteps: ['images', 'pricing', 'variations', 'services', 'description'],
    isComplete: false,
    createdAt: '2024-01-12T14:20:00Z',
    category: 'Electrical Components'
  }
];

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useParams();

  const handleAddProduct = () => {
    navigate(`/${lang}/products/add/product-info`);
  };

  const handleEditProduct = (productId: string, incompleteSteps?: string[]) => {
    // If product has incomplete steps, navigate to the first incomplete step
    if (incompleteSteps && incompleteSteps.length > 0) {
      const firstIncompleteStep = incompleteSteps[0];
      const stepRoutes = {
        'productInfo': 'product-info',
        'attributes': 'attributes', 
        'images': 'images',
        'pricing': 'pricing',
        'variations': 'variations',
        'services': 'services',
        'description': 'description'
      };
      const route = stepRoutes[firstIncompleteStep as keyof typeof stepRoutes] || 'product-info';
      navigate(`/${lang}/products/edit/${productId}/${route}`);
    } else {
      // Navigate to first step if complete
      navigate(`/${lang}/products/edit/${productId}/product-info`);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    // Implement delete functionality
    console.log('Delete product:', productId);
  };

  const handleViewProduct = (productId: string) => {
    // Navigate to product detail view
    navigate(`/${lang}/products/view/${productId}`);
  };

  const getStatusBadge = (completionPercentage: number, isComplete: boolean) => {
    if (isComplete) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Complete
        </span>
      );
    } else if (completionPercentage >= 70) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Nearly Complete
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Incomplete
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog and listings</p>
          </div>
          
          <Button
            variant="solid"
            onClick={handleAddProduct}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {mockProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first product</p>
          <Button
            variant="solid"
            onClick={handleAddProduct}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Your First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Product Image */}
              <div className="aspect-video bg-gray-100 relative">
                {product.images.length > 0 ? (
                  <DynamicImage
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(product.completionPercentage, product.isComplete)}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Completion</span>
                    <span>{product.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-cb-red h-2 rounded-full transition-all duration-300"
                      style={{ width: `${product.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Incomplete Steps Warning */}
                {product.incompleteSteps.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800 font-medium mb-1">
                          Missing: {product.incompleteSteps.length} step(s)
                        </p>
                        <p className="text-xs text-yellow-700">
                          Complete all steps to publish your product
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={() => handleEditProduct(product._id, product.incompleteSteps)}
                    leftIcon={<Edit className="h-3 w-3" />}
                    className="flex-1"
                  >
                    {product.incompleteSteps.length > 0 ? 'Complete' : 'Edit'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProduct(product._id)}
                    // leftIcon={<Eye className="h-3 w-3" />}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product._id)}
                    // leftIcon={<Trash2 className="h-3 w-3" />}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;