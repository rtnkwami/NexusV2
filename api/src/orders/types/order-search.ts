import { OrderStatusType } from '../entities/order.entity';

export type OrderSearchFilters = {
  dateRange?: { from: string; to: string };
  status?: OrderStatusType;
  customer?: string;
};
