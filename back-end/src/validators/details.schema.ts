import { z } from 'zod'

export const detailsFiltersSchema = z.object({
  status_filter: z.number().int().optional(),
  client_id: z.number().int().optional(),
  itsm_name: z.string().max(50).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
})
