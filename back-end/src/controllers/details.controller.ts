import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { detailsFiltersSchema } from '../validators/details.schema.js'
import { createDetailsService } from '../services/details.service.js'

const handleDetails =
  (procedureName: string) =>
  async (req: Request, res: Response) => {
    try {
      const filters = detailsFiltersSchema.parse(req.body)

      const service = createDetailsService(procedureName)
      const data = await service(filters)

      return res.json(data)
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: err.issues,
        })
      }

      console.error(`Error executing ${procedureName}:`, err)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

export const getTickets = handleDetails('silver.sp_ticketsDetails')
export const getChanges = handleDetails('silver.sp_changesDetails')
export const getProblems = handleDetails('silver.sp_problemsDetails')
export const getTasks = handleDetails('silver.sp_tasksDetails')
export const getKnowledges = handleDetails('silver.sp_knowledgeDetails')
export const getSatisfactions = handleDetails('silver.sp_satisfactionDetails')
