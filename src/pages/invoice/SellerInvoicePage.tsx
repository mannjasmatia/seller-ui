import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import {
  FileText,
  DollarSign,
  User,
  Building,
  Calendar,
  Package,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  Eye,
  Shield,
  Truck,
  CreditCard,
  Mail,
  Phone,
  Printer,
  Share2
} from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import { customToast } from '../../toast-config/customToast';
import { useGetInvoiceDetailsApi } from '../../api/api-hooks/useInvoiceApi';





const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || '';

interface InvoiceDetails {
  _id: string;
  quotationId: {
    _id: string;
    quantity: number;
    deadline: string;
    description?: string;
    minPrice: number;
    maxPrice: number;
    state: string;
    pinCode: string;
    attributes?: Array<{
      field: string;
      value: string;
    }>;
    productId?: {
      _id: string;
      name: string;
      images?: string[];
      category?: string;
      description?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  sellerId: {
    _id: string;
    companyName: string;
    email: string;
    profileImage?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  buyer: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    city?: string;
    state?: string;
    profilePic?: string;
  };
  chatId: string;
  negotiatedPrice: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  taxAmount?: number;
  shippingCharges?: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  createdAt: string;
  expiresAt: string;
  viewedByBuyer: boolean;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

const SellerInvoicePage: React.FC = () => {
  const { invoiceToken } = useParams<{ invoiceToken: string }>();
  const navigate = useNavigate();
  const language = (useSelector((state: RootState) => state.language?.value) as any)['invoicePage'] || {};

  // State
  const [timeRemaining, setTimeRemaining] = useState('');

  // API Hooks
  const {
    data: invoiceData,
    isLoading: isLoadingInvoice,
    isError: isInvoiceError,
    error: invoiceError,
    refetch: refetchInvoice
  } = useGetInvoiceDetailsApi(invoiceToken || '');

  const invoice: InvoiceDetails | null = invoiceData?.data?.response || null;

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  // Update time remaining every minute
  useEffect(() => {
    if (invoice) {
      const updateTime = () => {
        setTimeRemaining(getTimeRemaining(invoice.expiresAt));
      };
      
      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [invoice]);

  // Action handlers
  const handleDownload = () => {
    customToast.info('Download functionality coming soon');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && invoiceToken) {
      navigator.share({
        title: 'Invoice Details',
        text: `Invoice #${invoice?._id.slice(-8)} - ${formatCurrency(invoice?.totalAmount || 0)}`,
        url: window.location.href
      }).catch(() => {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.href);
        customToast.success('Invoice link copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      customToast.success('Invoice link copied to clipboard');
    }
  };

  const handleBackToInbox = () => {
    navigate('/inbox');
  };

  // Loading state
  if (isLoadingInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cb-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isInvoiceError || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">
            {(invoiceError as any)?.response?.data?.message || 
             'The invoice you\'re looking for doesn\'t exist or has expired.'}
          </p>
          <Button
            variant="outline"
            size="md"
            onClick={handleBackToInbox}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Inbox
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invoice.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToInbox}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Inbox
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-cb-red" />
                  Invoice Details
                </h1>
                <p className="text-gray-600">Invoice ID: #{invoice._id.slice(-8)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(invoice.status)}`}>
                {getStatusIcon(invoice.status)}
                <span className="font-medium capitalize">{invoice.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Banners */}
        {invoice.status === 'pending' && !isExpired && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Clock className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Awaiting Customer Response</h3>
                <p className="text-amber-800 mb-4">
                  This invoice has been sent to the customer and is awaiting their review and response.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{timeRemaining}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {invoice.status === 'accepted' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Invoice Accepted</h3>
                <p className="text-green-800">
                  Customer accepted this invoice on {invoice.acceptedAt ? formatDate(invoice.acceptedAt) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        )}

        {invoice.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900">Invoice Rejected</h3>
                <p className="text-red-800 mb-2">
                  Customer rejected this invoice on {invoice.rejectedAt ? formatDate(invoice.rejectedAt) : 'Unknown'}
                </p>
                {invoice.rejectionReason && (
                  <div className="bg-red-100 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Reason:</strong> {invoice.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isExpired && invoice.status === 'pending' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Invoice Expired</h3>
                <p className="text-gray-800">This invoice expired on {formatDate(invoice.expiresAt)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Invoice Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Invoice Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Negotiated Price:</span>
                    <span className="font-semibold text-lg text-gray-900">
                      {formatCurrency(invoice.negotiatedPrice)}
                    </span>
                  </div>
                  
                  {invoice.taxAmount && invoice.taxAmount > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Tax Amount:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice.taxAmount)}
                      </span>
                    </div>
                  )}
                  
                  {invoice.shippingCharges && invoice.shippingCharges > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Shipping Charges:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(invoice.shippingCharges)}
                      </span>
                    </div>
                  )}
                  
                  {/* <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-cb-red">
                      {invoice.totalAmount}
                    </span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Product Information */}
            {invoice.quotationId.productId && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <Package className="w-6 h-6 text-blue-600" />
                    Product Details
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* {invoice.quotationId.productId.images && invoice.quotationId.productId.images[0] && (
                      <DynamicImage
                        src={`${MEDIA_URL}/${invoice.quotationId.productId.images[0]}`}
                        alt={invoice.quotationId.productId.name}
                        width="w-24"
                        height="h-24"
                        objectFit="cover"
                        rounded="lg"
                        className="flex-shrink-0"
                      />
                    )} */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {invoice.quotationId.productId.name}
                      </h3>
                      {invoice.quotationId.productId.category && (
                        <p className="text-sm text-gray-600 mb-3">
                          Category: {invoice.quotationId.productId.category}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <span className="ml-2 font-medium">{invoice.quotationId.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deadline:</span>
                          <span className="ml-2 font-medium">
                            {new Date(invoice.quotationId.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quotation Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                  Quotation Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Original Price Range:</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(invoice.quotationId.minPrice)} - {formatCurrency(invoice.quotationId.maxPrice)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Quantity Requested:</span>
                      <p className="font-medium text-gray-900">{invoice.quotationId.quantity} units</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Delivery Deadline:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(invoice.quotationId.deadline).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Delivery Location:</span>
                      <p className="font-medium text-gray-900">{invoice.quotationId.state}, {invoice.quotationId.pinCode}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Quotation Status:</span>
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Accepted
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Quote Created:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(invoice.quotationId.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {invoice.quotationId.description && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Customer Requirements:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {invoice.quotationId.description}
                    </p>
                  </div>
                )}
                
                {invoice.quotationId.attributes && invoice.quotationId.attributes.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Additional Specifications:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {invoice.quotationId.attributes.map((attr, index) => (
                        <div key={index} className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600 capitalize">{attr.field}:</span>
                          <span className="text-sm font-medium text-gray-900">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {invoice.notes && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Invoice Notes:</h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            {invoice.buyer && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Customer Details
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      { (
                        (invoice.buyer.fullName || 'Customer').charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {invoice.buyer?.fullName || 'Customer Name'}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {invoice.buyer?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span>{invoice.buyer.email}</span>
                          </div>
                        )}
                        {invoice.buyer?.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{invoice.buyer.phoneNumber}</span>
                          </div>
                        )}
                        {(invoice.buyer?.city || invoice.buyer?.state) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {[invoice.buyer.city, invoice.buyer.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Invoice viewing status */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {invoice.viewedByBuyer ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Viewed by Customer</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span className="text-xs text-amber-600 font-medium">Not yet viewed</span>
                            </>
                          )}
                        </div>
                        {invoice.viewedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Viewed on {formatDate(invoice.viewedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Timeline
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Invoice Created</p>
                      <p className="text-sm text-gray-600">{formatDate(invoice.createdAt)}</p>
                    </div>
                  </div>
                  
                  {invoice.viewedByBuyer && invoice.viewedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Viewed by Customer</p>
                        <p className="text-sm text-gray-600">{formatDate(invoice.viewedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {invoice.status === 'accepted' && invoice.acceptedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Invoice Accepted</p>
                        <p className="text-sm text-gray-600">{formatDate(invoice.acceptedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  {invoice.status === 'rejected' && invoice.rejectedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Invoice Rejected</p>
                        <p className="text-sm text-gray-600">{formatDate(invoice.rejectedAt)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${isExpired ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {isExpired ? 'Expired' : 'Expires'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(invoice.expiresAt)}</p>
                      {!isExpired && invoice.status === 'pending' && (
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          {timeRemaining}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="space-y-3">
                  <Button
                    variant="solid"
                    size="md"
                    onClick={handleDownload}
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                    theme={['cb-red', 'white']}
                  >
                    Download PDF
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handlePrint}
                    className="w-full"
                    leftIcon={<Printer className="w-4 h-4" />}
                  >
                    Print Invoice
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleShare}
                    className="w-full"
                    leftIcon={<Share2 className="w-4 h-4" />}
                  >
                    Share Invoice
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> This invoice is awaiting customer response. You'll be notified when the customer takes action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerInvoicePage;