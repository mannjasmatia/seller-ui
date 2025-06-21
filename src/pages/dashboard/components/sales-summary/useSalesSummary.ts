// useSalesSummary.ts
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customToast } from '../../../../toast-config/customToast';
import translations from './translations.json';

// Types
export interface SalesData {
  totalProductShipped: string;
  inProgress: string;
  totalProductViewed: string;
  totalQuotationReceived: string;
  totalOrderAccepted: string;
  totalOrderRejected: string;
  popularityScore: number;
}

export interface PopularityDataItem {
  name: string;
  value: number;
  color: string;
}

// Mock data for sales summary
const mockSalesData: SalesData = {
  totalProductShipped: '4.5K',
  inProgress: '600',
  totalProductViewed: '5K',
  totalQuotationReceived: '4K',
  totalOrderAccepted: '3.5K',
  totalOrderRejected: '500',
  popularityScore: 66,
};

// Mock API function (replace with actual API call)
const fetchSalesData = async (): Promise<SalesData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In real implementation, this would be an actual API call
  // const response = await fetch('/api/sales-summary');
  // return response.json();
  
  return mockSalesData;
};

export const useSalesSummary = () => {
  // Default data while loading or on error
  const currentSalesData = mockSalesData;

  // Popularity chart data
  const popularityData: PopularityDataItem[] = [
    {
      name: 'Popular',
      value: currentSalesData.popularityScore,
      color: '#dc2626', // cb-red
    },
    {
      name: 'Remaining',
      value: 100 - currentSalesData.popularityScore,
      color: '#e5e7eb', // gray-200
    },
  ];

  // Handle view more clicks with dynamic navigation
  const handleViewMore = useCallback((type: string) => {
    const actions = {
      shipped: () => {
        customToast.info('Navigating to shipped products...');
        // Add router.push('/products/shipped') or navigation logic
      },
      inProgress: () => {
        customToast.info('Navigating to in-progress orders...');
        // Add router.push('/orders/in-progress') or navigation logic
      },
      viewed: () => {
        customToast.info('Navigating to product analytics...');
        // Add router.push('/analytics/products') or navigation logic
      },
      quotation: () => {
        customToast.info('Navigating to quotations...');
        // Add router.push('/quotations') or navigation logic
      },
      accepted: () => {
        customToast.info('Navigating to accepted orders...');
        // Add router.push('/orders/accepted') or navigation logic
      },
      rejected: () => {
        customToast.info('Navigating to rejected orders...');
        // Add router.push('/orders/rejected') or navigation logic
      },
    };

    const action = actions[type as keyof typeof actions];
    if (action) {
      action();
    } else {
      customToast.error(`Unknown navigation type: ${type}`);
    }
  }, []);

  return {
    salesData: currentSalesData,
    popularityData,
    translations,
    handleViewMore,
  };
};

export default useSalesSummary;