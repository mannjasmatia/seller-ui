import React from 'react';
import { Search, Filter, RefreshCw, Inbox as InboxIcon, AlertCircle } from 'lucide-react';
import Button from '../../components/BasicComponents/Button';
import Input from '../../components/BasicComponents/Input';
import ConfirmationModal from '../../modals/ConfirmationModal';
import useInquiry from './useInquiry';
import InquiryCard from './components/InquiryCard';
import QuotationDetailModal from './components/QuotationDetailModal';
import InvoiceModal from '../inbox/components/GenerateInvoiceModal';

const Inquiry: React.FC = () => {
  const {
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
    
    // Modal state
    isDetailModalOpen,
    
    // Handlers
    handleFilterChange,
    handleSearchChange,
    clearFilters,
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
  } = useInquiry();

  // Confirmation modals state
  const [confirmAction, setConfirmAction] = React.useState<{
    type: 'accept' | 'reject' | 'negotiate' | null;
    quotationId: string | null;
  }>({ type: null, quotationId: null });

  const handleConfirmAction = () => {
    if (confirmAction.type && confirmAction.quotationId) {
      switch (confirmAction.type) {
        case 'accept':
          handleAcceptQuotation(confirmAction.quotationId);
          break;
        case 'reject':
          handleRejectQuotation(confirmAction.quotationId);
          break;
        case 'negotiate':
          handleNegotiateQuotation(confirmAction.quotationId);
          break;
      }
    }
    setConfirmAction({ type: null, quotationId: null });
  };

  const openConfirmation = (type: 'accept' | 'reject' | 'negotiate', quotationId: string) => {
    setConfirmAction({ type, quotationId });
  };

  const closeConfirmation = () => {
    setConfirmAction({ type: null, quotationId: null });
  };

  const getConfirmationContent = () => {
    switch (confirmAction.type) {
      case 'accept':
        return {
          title: language.confirmations.acceptTitle,
          message: language.confirmations.acceptMessage,
          confirmText: language.actions.accept
        };
      case 'reject':
        return {
          title: language.confirmations.rejectTitle,
          message: language.confirmations.rejectMessage,
          confirmText: language.actions.reject
        };
      case 'negotiate':
        return {
          title: language.confirmations.negotiateTitle,
          message: language.confirmations.negotiateMessage,
          confirmText: language.actions.negotiate
        };
      default:
        return {
          title: '',
          message: '',
          confirmText: ''
        };
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <InboxIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {language.noQuotations}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {language.noQuotationsDescription}
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {language.errorLoading}
      </h3>
      <Button
        variant="outline"
        size="md"
        onClick={() => refetchQuotations()}
        theme={['cb-red', 'white']}
      >
        {language.retry}
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-white rounded-2xl">
      <div className="">
        <div className="">
            {/* Header */}
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language.title}
            </h1>
            <p className="text-gray-600">
                {language.subtitle}
            </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                <Input
                    type="text"
                    placeholder={language.filters.searchPlaceholder}
                    value={filters.search}
                    onChange={(value) => handleSearchChange(value as string)}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="w-full"
                />
                </div>

                {/* Status Filter */}
                <div>
                <Input
                    type="select"
                    value={filters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                    options={[
                    { label: language.filters.allStatus, value: '' },
                    { label: language.filters.pending, value: 'pending' },
                    { label: language.filters.accepted, value: 'accepted' },
                    { label: language.filters.rejected, value: 'rejected' },
                    { label: language.filters.negotiation, value: 'negotiation' }
                    ]}
                    leftIcon={<Filter className="w-4 h-4" />}
                />
                </div>

                {/* Seen Filter */}
                <div>
                <Input
                    type="select"
                    value={filters.seen?.toString()}
                    onChange={(value) => handleFilterChange('seen', value === '' ? '' : value === 'true')}
                    options={[
                    { label: language.filters.allVisibility, value: '' },
                    { label: language.filters.seen, value: 'true' },
                    { label: language.filters.unseen, value: 'false' }
                    ]}
                />
                </div>
            </div>

            {/* Filter Actions */}
            {hasActiveFilters() && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                    Filters applied
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    theme={['cb-red', 'white']}
                >
                    {language.filters.clearFilters}
                </Button>
                </div>
            )}
            </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header with refresh */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quotations ({quotations.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchQuotations()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              disabled={isLoadingQuotations}
              theme={['cb-red', 'white']}
            >
              Refresh
            </Button>
          </div>

          {/* Content Area */}
          <div className="p-4">
            {isLoadingQuotations ? (
              renderLoadingState()
            ) : isQuotationsError ? (
              renderErrorState()
            ) : quotations.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {quotations.map((quotation) => (
                  <InquiryCard
                    key={quotation._id}
                    quotation={quotation}
                    onViewDetails={openDetailModal}
                    onAccept={(id) => openConfirmation('accept', id)}
                    onReject={(id) => openConfirmation('reject', id)}
                    onNegotiate={(id) => openConfirmation('negotiate', id)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getTimeAgo={getTimeAgo}
                    getStatusColor={getStatusColor}
                    language={language}
                    isAccepting={isGeneratingInvoice}
                    isRejecting={isRejecting}
                    isNegotiating={isNegotiating}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {quotations.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!pagination.hasPrev || isLoadingQuotations}
                  theme={['cb-red', 'white']}
                >
                  {language.pagination.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext || isLoadingQuotations}
                  theme={['cb-red', 'white']}
                >
                  {language.pagination.next}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {language.pagination.page
                  .replace('{{current}}', filters.page.toString())
                  .replace('{{total}}', pagination.totalPages.toString())}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
            open={isInvoiceModalOpen}
            onClose={closeInvoiceModal}
            onGenerate={handleGenerateInvoice}
            isGenerating={isGeneratingInvoice}
            quotationPriceRange={{min:quotationDetail?.minPrice as number, max:quotationDetail?.minPrice as number, }}
        />
      

      {/* Detail Modal */}
      <QuotationDetailModal
        open={isDetailModalOpen}
        quotation={quotationDetail}
        isLoading={isLoadingDetail}
        onClose={closeDetailModal}
        onAccept={(id) => openConfirmation('accept', id)}
        onReject={(id) => openConfirmation('reject', id)}
        onNegotiate={(id) => openConfirmation('negotiate', id)}
        isAccepting={isGeneratingInvoice}
        isRejecting={isRejecting}
        isNegotiating={isNegotiating}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={confirmAction.type !== null}
        title={getConfirmationContent().title}
        description={getConfirmationContent().message}
        confirmButtonText={getConfirmationContent().confirmText}
        onClose={closeConfirmation}
        onConfirm={handleConfirmAction}
        isLoading={isGeneratingInvoice || isRejecting || isNegotiating}
        theme={confirmAction.type === 'reject' ? ['red-500', 'white'] : ['cb-red', 'white']}
      />
    </div>
  );
};

export default Inquiry;