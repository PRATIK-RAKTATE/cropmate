import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { Alert } from '../models/Alert.js'
import { SoilReport } from '../models/SoilReport.js'
import { demoFarmers, demoFarms, demoSoilReports, demoNewsData } from '../seed/demoData.js'

export async function seedDemoData() {
  const farmerCount = await Farmer.countDocuments()

  if (farmerCount > 0) {
    return
  }

  const farmers = await Farmer.create(demoFarmers)
  const farmersByMobile = Object.fromEntries(
    farmers.map((farmer) => [farmer.mobile, farmer]),
  )

  const farms = await Farm.insertMany(
    demoFarms.map((farm) => ({
      ...farm,
      farmerId: farmersByMobile[farm.farmerMobile]._id,
    })),
  )

  const farmsByName = Object.fromEntries(farms.map((farm) => [farm.name, farm]))

  const soilReports = await SoilReport.insertMany(
    demoSoilReports.map((report) => ({
      ...report,
      farmId: farmsByName[report.farmName]._id,
    })),
  )

  const mainFarmer = farmersByMobile['9999999991']
  const mainFarm = farmsByName['Main Farm']
  const mainSoil = soilReports.find((report) => report.farmId.equals(mainFarm._id))

  await CropRecommendation.create({
    farmerId: mainFarmer._id,
    farmId: mainFarm._id,
    soilReportId: mainSoil._id,
    season: 'kharif',
    budget: 'medium',
    weatherSource: 'seed',
    recommendations: [
      {
        crop: 'Soybean',
        suitabilityScore: 88,
        profitabilityScore: 76,
        sustainabilityScore: 86,
        riskLevel: 'medium',
        durationDays: 105,
        waterNeed: 'medium',
        reason:
          'Suitable pH, seasonal rainfall, and moderate water fit soybean well for this farm.',
        nextSteps: [
          'Prepare land before the first stable rains.',
          'Use certified seeds for uniform germination.',
          'Monitor yellow mosaic pressure after 30 days.',
        ],
        scoreBreakdown: {
          soil: 89,
          weather: 84,
          water: 82,
        },
      },
    ],
  })

  const tomatoFarm = farmsByName['Tomato Plot']
  const tomatoFarmer = farmersByMobile['9999999992']

  await DiseaseReport.insertMany([
    {
      farmerId: tomatoFarmer._id,
      farmId: tomatoFarm._id,
      crop: 'tomato',
      imageUrl: '/uploads/demo-tomato-1.jpg',
      disease: 'Early Blight',
      confidence: 84,
      severity: 'medium',
      immediateAction: [
        'Remove infected lower leaves.',
        'Avoid overhead irrigation.',
        'Inspect nearby plants today.',
      ],
      organicTreatment: ['Use neem-based preventive spray where disease is limited.'],
      chemicalTreatment: [
        'Use an approved fungicide after local advisory if spread increases.',
      ],
      preventionTips: [
        'Maintain airflow between plants.',
        'Avoid leaving infected debris in the plot.',
      ],
      cause: 'Humid conditions and repeated leaf wetness increased fungal pressure.',
      rawSignals: ['seeded nearby outbreak'],
      fallbackUsed: true,
    },
    {
      farmerId: mainFarmer._id,
      farmId: mainFarm._id,
      crop: 'tomato',
      imageUrl: '/uploads/demo-tomato-2.jpg',
      disease: 'Early Blight',
      confidence: 78,
      severity: 'medium',
      immediateAction: ['Inspect lower leaves and improve drainage.'],
      organicTreatment: ['Use neem-based preventive spray.'],
      chemicalTreatment: ['Escalate to local expert if spread continues.'],
      preventionTips: ['Avoid overhead irrigation for the next few days.'],
      cause: 'Nearby disease pressure combined with humid weather.',
      rawSignals: ['seeded nearby outbreak'],
      fallbackUsed: true,
    },
  ])

  // Seed demo alerts for the main farmer
  await Alert.insertMany(demoNewsData.map(news => ({
    ...news,
    farmerId: mainFarmer._id,
    priority: 'medium',
  })))
}
