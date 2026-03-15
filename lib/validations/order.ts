import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { orders, orderItems } from '@/lib/db/schema';

export const selectOrderSchema = createSelectSchema(orders);
export const selectOrderItemSchema = createSelectSchema(orderItems);

export type Order = z.infer<typeof selectOrderSchema>;
export type OrderItem = z.infer<typeof selectOrderItemSchema>;

export const orderWithItemsSchema = selectOrderSchema.extend({
  items: z.array(selectOrderItemSchema),
});
export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;
