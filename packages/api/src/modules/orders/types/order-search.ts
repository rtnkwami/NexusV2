import { OrderStatusEnum } from 'src/generated/prisma/enums';

export type OrderSearchFilters = {
  dateRange?: { from: string; to: string };
  status?: OrderStatusEnum;
};
