import { OrderStatusType } from '../entities/order.entity';

export type OrderSearchFilters = {
  dateRange: { from: Date; to: Date };
  status: OrderStatusType;
  customer: string;
};
