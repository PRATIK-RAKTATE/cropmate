import { Router } from 'express'
import { adminLogin, demoLogin, login, register } from '../controllers/authController.js'
import { getAdminSummary, sendRegionalAlert, enhanceAdvisory } from '../controllers/adminController.js'
import { askAssistant, getChatSession } from '../controllers/assistantController.js'
import { uploadDiseaseImage, uploadDiseaseScan } from '../controllers/diseaseController.js'
import { getFarm, createFarm } from '../controllers/farmController.js'
import { getFarmer, listFarmers, getAlerts, markAlertRead } from '../controllers/farmerController.js'
import { getHistory } from '../controllers/historyController.js'
import { createRecommendation, extractSoil, uploadSoilReport } from '../controllers/recommendationController.js'
import { createSoilReport } from '../controllers/soilController.js'
import { resolveWeather } from '../controllers/weatherController.js'
import { resolveMarket } from '../controllers/marketController.js'

export const apiRouter = Router()

apiRouter.post('/auth/demo-login', demoLogin)
apiRouter.post('/auth/register', register)
apiRouter.post('/auth/login', login)
apiRouter.post('/auth/admin-login', adminLogin)
apiRouter.get('/farmers', listFarmers)
apiRouter.get('/farmers/:id', getFarmer)
apiRouter.get('/farmers/:farmerId/alerts', getAlerts)
apiRouter.post('/alerts/:alertId/read', markAlertRead)
apiRouter.post('/farms', createFarm)
apiRouter.get('/farms/:id', getFarm)
apiRouter.post('/soil-reports', createSoilReport)
apiRouter.post('/weather/resolve', resolveWeather)
apiRouter.post('/market/resolve', resolveMarket)
apiRouter.post('/recommendations/crop', createRecommendation)
apiRouter.post('/recommendations/extract-soil', uploadSoilReport.single('image'), extractSoil)
apiRouter.post('/disease/detect', uploadDiseaseImage.single('image'), uploadDiseaseScan)
apiRouter.post('/assistant/ask', askAssistant)
apiRouter.get('/assistant/session/:farmerId/:farmId', getChatSession)
apiRouter.get('/history/:farmerId', getHistory)
apiRouter.get('/admin/summary', getAdminSummary)
apiRouter.post('/admin/regional-alert', sendRegionalAlert)
apiRouter.post('/admin/enhance-message', enhanceAdvisory)
