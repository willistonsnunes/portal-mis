import sql from 'mssql'
import dbConnect from '../database/_db.js'

export interface DetailsFiltersDTO {
  status_filter?: number
  client_id?: number
  itsm_name?: string
  start_date?: Date
  end_date?: Date
}


async function executeDetailsProcedure(
  procedureName: string,
  filters: DetailsFiltersDTO
) {
  const pool = await dbConnect

  const request = pool.request()
    .input('status_filter', sql.Int, filters.status_filter ?? null)
    .input('client_id', sql.Int, filters.client_id ?? null)
    .input('itsm_name', sql.VarChar(50), filters.itsm_name ?? null)
    .input('start_date', sql.Date, filters.start_date ?? null)
    .input('end_date', sql.Date, filters.end_date ?? null)

  const result = await request.execute(procedureName)
  return result.recordset
}

export function createDetailsService(procedureName: string) {
  return (filters: DetailsFiltersDTO) =>
    executeDetailsProcedure(procedureName, filters)
}
