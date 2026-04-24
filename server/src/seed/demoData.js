export const demoFarmers = [
  {
    name: 'Ramesh Patil',
    mobile: '9999999991',
    preferredLanguage: 'mr',
    village: 'Nashik Road',
    district: 'Nashik',
    state: 'Maharashtra',
  },
  {
    name: 'Sita Jadhav',
    mobile: '9999999992',
    preferredLanguage: 'hi',
    village: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
  },
  {
    name: 'Arun Shinde',
    mobile: '9999999993',
    preferredLanguage: 'en',
    village: 'Sinnar',
    district: 'Nashik',
    state: 'Maharashtra',
  },
]

export const demoFarms = [
  {
    farmerMobile: '9999999991',
    name: 'Main Farm',
    location: {
      village: 'Nashik Road',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.9975,
      lng: 73.7898,
    },
    farmSizeAcres: 3,
    soilType: 'black_soil',
    irrigationSource: 'well',
    waterAvailability: 'medium',
    previousCrop: 'onion',
    currentSeason: 'kharif',
    budget: 'medium',
    farmingType: 'conventional',
  },
  {
    farmerMobile: '9999999992',
    name: 'Tomato Plot',
    location: {
      village: 'Niphad',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 20.084,
      lng: 73.798,
    },
    farmSizeAcres: 2,
    soilType: 'loamy_soil',
    irrigationSource: 'canal',
    waterAvailability: 'medium',
    previousCrop: 'soybean',
    currentSeason: 'rabi',
    budget: 'medium',
    farmingType: 'conventional',
  },
  {
    farmerMobile: '9999999993',
    name: 'Village Edge Farm',
    location: {
      village: 'Sinnar',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.8456,
      lng: 74.0011,
    },
    farmSizeAcres: 4.5,
    soilType: 'alluvial_soil',
    irrigationSource: 'drip',
    waterAvailability: 'low',
    previousCrop: 'wheat',
    currentSeason: 'kharif',
    budget: 'high',
    farmingType: 'mixed',
  },
]

export const demoSoilReports = [
  {
    farmName: 'Main Farm',
    nitrogen: 70,
    phosphorus: 45,
    potassium: 40,
    ph: 6.8,
    moisture: 34,
    organicCarbon: 0.7,
  },
  {
    farmName: 'Tomato Plot',
    nitrogen: 62,
    phosphorus: 48,
    potassium: 58,
    ph: 6.5,
    moisture: 27,
    organicCarbon: 0.8,
  },
  {
    farmName: 'Village Edge Farm',
    nitrogen: 68,
    phosphorus: 38,
    potassium: 42,
    ph: 7.0,
    moisture: 22,
    organicCarbon: 0.6,
  },
]

export const fallbackWeatherByDistrict = {
  Nashik: {
    current: {
      temperature: 28,
      humidity: 72,
      rainfall: 8,
      windSpeed: 11,
    },
    forecast: {
      rainfallTotal: 72,
      temperatureMax: 31,
      temperatureMin: 22,
      humidityAverage: 74,
      windowDays: 7,
    },
  },
}
