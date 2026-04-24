import { Router } from 'express'
import { demoLogin, login, register } from '../controllers/authController.js'
import { getAdminSummary } from '../controllers/adminController.js'
import { askAssistant, getChatSession } from '../controllers/assistantController.js'
import { uploadDiseaseImage, uploadDiseaseScan } from '../controllers/diseaseController.js'
import { getFarm, createFarm } from '../controllers/farmController.js'
import { getFarmer, listFarmers } from '../controllers/farmerController.js'
import { getHistory } from '../controllers/historyController.js'
import { getRadarAlert } from '../controllers/radarController.js'
import { createRecommendation } from '../controllers/recommendationController.js'
import { createSoilReport } from '../controllers/soilController.js'
import { resolveWeather } from '../controllers/weatherController.js'

export const apiRouter = Router()

apiRouter.post('/auth/demo-login', demoLogin)
apiRouter.post('/auth/register', register)
apiRouter.post('/auth/login', login)
apiRouter.get('/farmers', listFarmers)
apiRouter.get('/farmers/:id', getFarmer)
apiRouter.post('/farms', createFarm)
apiRouter.get('/farms/:id', getFarm)
apiRouter.post('/soil-reports', createSoilReport)
apiRouter.post('/weather/resolve', resolveWeather)
apiRouter.post('/recommendations/crop', createRecommendation)
apiRouter.post('/disease/detect', uploadDiseaseImage.single('image'), uploadDiseaseScan)
apiRouter.post('/assistant/ask', askAssistant)
apiRouter.get('/assistant/session/:farmerId/:farmId', getChatSession)
apiRouter.get('/history/:farmerId', getHistory)
apiRouter.get('/radar/:farmId', getRadarAlert)
apiRouter.get('/admin/summary', getAdminSummary)
