import { SoilReport } from '../models/SoilReport.js'
import { soilReportSchema } from '../schemas/soilSchema.js'
import { validate } from '../middleware/validate.js'

export async function createSoilReport(request, response) {
  const payload = validate(soilReportSchema, request.body)
  const report = await SoilReport.create(payload)
  response.status(201).json(report)
}
