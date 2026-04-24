import { Alert } from '../models/Alert.js'
import { SmsLog } from '../models/SmsLog.js'
import { Farmer } from '../models/Farmer.js'

/**
 * Send a notification to a specific farmer or a group of farmers.
 */
export async function sendNotification({
  farmerId,
  region, // { village, district, state }
  category,
  priority,
  title,
  message,
}) {
  let targetFarmers = []

  if (farmerId) {
    const farmer = await Farmer.findById(farmerId)
    if (farmer) targetFarmers.push(farmer)
  } else if (region) {
    const query = {}
    if (region.village) query.village = region.village
    if (region.district) query.district = region.district
    if (region.state) query.state = region.state
    targetFarmers = await Farmer.find(query)
  }

  const notifications = targetFarmers.map((farmer) => ({
    farmerId: farmer._id,
    region: region || { 
      village: farmer.village, 
      district: farmer.district, 
      state: farmer.state 
    },
    category,
    priority,
    title,
    message,
    sentSms: priority === 'high',
  }))

  const savedNotifications = await Alert.insertMany(notifications)

  // If priority is high, send SMS
  if (priority === 'high') {
    for (const farmer of targetFarmers) {
      await sendSms(farmer, message, priority)
    }
  }

  return savedNotifications
}

async function sendSms(farmer, message, priority) {
  // This is a placeholder for actual SMS integration (MSG91/Twilio)
  console.log(`[SMS] Sending to ${farmer.mobile}: ${message}`)

  const log = await SmsLog.create({
    farmerId: farmer._id,
    mobile: farmer.mobile,
    message,
    priority,
    status: 'sent', // Mocking success
    provider: 'MockProvider',
  })

  return log
}

export async function getFarmerAlerts(farmerId) {
  return Alert.find({ farmerId }).sort({ createdAt: -1 }).limit(20)
}

export async function markAsRead(alertId) {
  return Alert.findByIdAndUpdate(alertId, { isRead: true }, { new: true })
}
