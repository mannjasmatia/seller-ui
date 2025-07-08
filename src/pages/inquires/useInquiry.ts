import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/appStore';
import { 
  useGetQuotationsApi, 
  useGetQuotationByIdApi,
  useAcceptQuotationApi,
  useRejectQuotationApi,
  useNegotiateQuotationApi
} from '../../api/api-hooks/useQuotationApi';
import { Quotation, QuotationDetail, QuotationFilters } from './types.quotation';
import { customToast } from '../../toast-config/customToast';
import { useGenerateInvoiceApi } from '../../api/api-hooks/useInvoiceApi';


export const useInquiry = () => {
  const language = useSelector((state: RootState) => state.language?.value)['inbox'];
  
  // Filter state
  const [filters, setFilters] = useState<QuotationFilters>({
    status: '',
    seen: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Modal state
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // API calls
  const { 
    data: quotationsData, 
    isLoading: isLoadingQuotations, 
    isError: isQuotationsError,
    refetch: refetchQuotations
  } = useGetQuotationsApi({
    page: filters.page,
    limit: filters.limit,
    status: filters.status || undefined,
    seen: filters.seen !== '' ? filters.seen : undefined,
    search: debouncedSearch || undefined
  });

  const {
    data: quotationDetailData,
    isLoading: isLoadingDetail,
    isError: isDetailError
  } = useGetQuotationByIdApi(selectedQuotationId || '');

  // ==> Not using this api anymore
  // const {
  //   mutate: acceptQuotation,
  //   isPending: isAccepting
  // } = useAcceptQuotationApi();

  // using generate invoice to accept quotation
  const {
      mutate: generateInvoice,
      isPending: isGeneratingInvoice
    } = useGenerateInvoiceApi();

  const {
    mutate: rejectQuotation,
    isPending: isRejecting
  } = useRejectQuotationApi();

  const {
    mutate: negotiateQuotation,
    isPending: isNegotiating
  } = useNegotiateQuotationApi();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Reset to first page when filters change
  useEffect(() => {
    if (filters.page !== 1) {
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  }, [filters.status, filters.seen, debouncedSearch]);

  // Extract data from API responses
  const quotations: Quotation[] = quotationsData?.data?.response?.docs || [];
  const quotationDetail: QuotationDetail | null = quotationDetailData?.data?.response || null;
  const pagination = quotationsData?.data?.response || { hasPrev: false, hasNext: false, totalPages: 0 };

  // Filter handlers
  const handleFilterChange = (key: keyof QuotationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      seen: '',
      search: '',
      page: 1,
      limit: 10
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleNextPage = () => {
    if (pagination.hasNext) {
      handlePageChange(filters.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      handlePageChange(filters.page - 1);
    }
  };

  // Modal handlers
  const openDetailModal = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedQuotationId('');
  };

  // Action handlers
  const handleAcceptQuotation = (quotationId: string) => {
    console.log("Quotation id : ", quotationId)
    setIsInvoiceModalOpen(true);
    setSelectedQuotationId(quotationId)
    // acceptQuotation(quotationId, {
    //   onSuccess: (response) => {
    //     customToast.success(language.success.quotationAccepted);
    //     closeDetailModal();
    //     refetchQuotations();
    //   },
    //   onError: (error: any) => {
    //     customToast.error(error?.response?.data?.message || language.errors.acceptFailed);
    //   }
    // });
  };

  // Invoice handlers
  const handleGenerateInvoice = useCallback((invoiceData: {
    negotiatedPrice: number;
    paymentTerms?: string;
    deliveryTerms?: string;
    taxAmount?: number;
    shippingCharges?: number;
    notes?: string;
  }) => {
    const data ={
      quotationId:selectedQuotationId as string,
      ...invoiceData
    }
    console.log("data : ", data)
    generateInvoice(data, {
      onSuccess: (response) => {
        customToast.success('Invoice generated successfully');
        setIsInvoiceModalOpen(false);
        setSelectedQuotationId('')
      },
      onError: (error: any) => {
        customToast.error(error?.response?.data?.message || 'Failed to generate invoice');
      }
    });
  }, [selectedQuotationId]);

  const closeInvoiceModal = useCallback(() => {
    setIsInvoiceModalOpen(false);
  }, []);

  const handleRejectQuotation = (quotationId: string) => {
    rejectQuotation(quotationId, {
      onSuccess: () => {
        customToast.success(language.success.quotationRejected);
        closeDetailModal();
        refetchQuotations();
      },
      onError: (error: any) => {
        customToast.error(error?.response?.data?.message || language.errors.rejectFailed);
      }
    });
  };

  const handleNegotiateQuotation = (quotationId: string) => {
    negotiateQuotation(quotationId, {
      onSuccess: () => {
        customToast.success(language.success.negotiationStarted);
        closeDetailModal();
        refetchQuotations();
      },
      onError: (error: any) => {
        customToast.error(error?.response?.data?.message || language.errors.negotiateFailed);
      }
    });
  };

  // Utility functions
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return language.quotationCard.timeAgo.justNow;
    } else if (diffInMinutes < 60) {
      return language.quotationCard.timeAgo.minutesAgo.replace('{{minutes}}', diffInMinutes.toString());
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return language.quotationCard.timeAgo.hoursAgo.replace('{{hours}}', hours.toString());
    } else if (diffInMinutes < 2880) {
      return language.quotationCard.timeAgo.yesterday;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return language.quotationCard.timeAgo.daysAgo.replace('{{days}}', days.toString());
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'negotiation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasActiveFilters = (): boolean => {
    return !!(filters.status || filters.seen !== '' || filters.search);
  };

  return {
    // Data
    quotations,
    quotationDetail,
    pagination,
    filters,
    
    // Loading states
    isLoadingQuotations,
    isLoadingDetail,
    isRejecting,
    isNegotiating,

    // invoice modal
    isInvoiceModalOpen,
    isGeneratingInvoice,
    handleGenerateInvoice,
    closeInvoiceModal,
    
    // Error states
    isQuotationsError,
    isDetailError,
    
    // Modal state
    isDetailModalOpen,
    selectedQuotationId,
    
    // Handlers
    handleFilterChange,
    handleSearchChange,
    clearFilters,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    openDetailModal,
    closeDetailModal,
    handleAcceptQuotation,
    handleRejectQuotation,
    handleNegotiateQuotation,
    refetchQuotations,
    
    // Utilities
    getTimeAgo,
    formatCurrency,
    formatDate,
    getStatusColor,
    hasActiveFilters,
    
    // Language
    language
  };
};

export default useInquiry;