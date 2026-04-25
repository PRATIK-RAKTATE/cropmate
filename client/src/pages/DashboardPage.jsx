import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CloudRain, MessageCircle, Sprout, ThermometerSun, Bell } from 'lucide-react'
import { Button, Card, Metric, PageHeader } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { riskTone, titleCase } from '../utils/format.js'
import { translations } from '../data/content.js'

export function DashboardPage() {
  const { session, latestRecommendation, language } = useAppContext()
  const copy = translations[language]
  const [weather, setWeather] = useState(null)
  const [market, setMarket] = useState([])
  const [history, setHistory] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.defaultFarm) {
      return
    }

    Promise.all([
      api.resolveWeather({
        lat: session.defaultFarm.location.lat,
        lng: session.defaultFarm.location.lng,
        district: session.defaultFarm.location.district,
      }),
      api.resolveMarket({
        district: session.defaultFarm.location.district,
        state: session.defaultFarm.location.state,
      }),
      api.getHistory(session.farmer._id),
      api.getAlerts(session.farmer._id),
    ])
      .then(([weatherPayload, marketPayload, historyPayload, alertsPayload]) => {
        setWeather(weatherPayload)
        setMarket(marketPayload)
        setHistory(historyPayload)
        setAlerts(alertsPayload.filter(a => !a.isRead).slice(0, 2))
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [session])

  return (
    <div>
      <PageHeader
        eyebrow={copy.dashboard}
        title={`${copy.namaste}, ${session?.farmer?.name?.split(' ')[0] || copy.farmer}`}
        description={copy.dashboardDesc}
        actions={
          <>
            <Link to="/soil">
              <Button variant="secondary">{copy.generateRec}</Button>
            </Link>
            <Link to="/assistant">
              <Button variant="primary">{copy.askCropMate}</Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-5 p-5 md:grid-cols-12 md:p-8">
        <Card className="md:col-span-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.currentFarm}</p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950">
                {session?.defaultFarm?.name}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                {session?.defaultFarm?.location?.village}, {session?.defaultFarm?.location?.district}
              </p>
            </div>
            <div className="rounded-full px-3 py-2 text-xs font-semibold bg-emerald-100 text-emerald-700">
              {copy.activePlot}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric
              label={copy.temp}
              value={weather ? `${weather.current.temperature}°C` : '--'}
              helper={copy.current}
            />
            <Metric
              label={copy.humidity}
              value={weather ? `${weather.current.humidity}%` : '--'}
              helper={copy.current}
            />
            <Metric
              label={copy.rainfall}
              value={weather ? `${weather.forecast.rainfallTotal} mm` : '--'}
              helper={copy.next7Days}
            />
            <Metric
              label={copy.water}
              value={titleCase(session?.defaultFarm?.waterAvailability || '') || '--'}
              helper={copy.farmAvailability}
            />
          </div>

          {weather?.fallbackUsed ? (
            <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {copy.weatherFallback}
            </p>
          ) : null}
        </Card>

        <Card className="bg-stone-950 text-white md:col-span-4 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-lime-300 mb-4">{copy.liveMarket}</p>
            <div className="space-y-3">
              {market.length > 0 ? (
                market.slice(0, 4).map((m, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{m.crop}</span>
                      <span className="text-[10px] text-stone-500 uppercase">{m.market || 'Regional'}</span>
                    </div>
                    <span className="text-sm font-bold text-lime-300">₹{m.price.toLocaleString()} / {m.unit}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-400 italic py-4 text-center">{copy.fetchingMarket}</p>
              )}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">{copy.latestNews}</p>
            {alerts.length > 0 ? (
              <p className="text-xs font-medium leading-relaxed italic">
                "{alerts[0].title}: {alerts[0].message.substring(0, 80)}..."
              </p>
            ) : (
              <p className="text-xs font-medium leading-relaxed italic text-stone-500">
                "{copy.noNews}"
              </p>
            )}
          </div>
        </Card>

        {alerts.length > 0 && (
          <Card className="md:col-span-12 border-l-4 border-l-amber-500 bg-amber-50/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900">{copy.unreadAlerts}</h3>
              </div>
              <Link to="/alerts" className="text-xs font-bold text-amber-700 hover:underline">{copy.viewAll}</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {alerts.map(alert => (
                <div key={alert._id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[9px] font-black uppercase rounded tracking-wider">{alert.category}</span>
                    <span className="text-[10px] text-stone-400 font-bold">{new Date(alert.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-bold text-stone-900 text-sm truncate">{alert.title}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-lime-100 p-3 text-lime-700">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.topCrop}</p>
              <h3 className="text-xl font-semibold text-stone-950">
                {latestRecommendation?.recommendations?.[0]?.crop || history?.recommendations?.[0]?.recommendations?.[0]?.crop || copy.generateRec}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            {latestRecommendation?.recommendations?.[0]?.reason ||
              history?.recommendations?.[0]?.recommendations?.[0]?.reason ||
              copy.startFromSoil}
          </p>
          <Link to="/recommendations" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
            {copy.viewRecommendation}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.diseaseScans}</p>
              <h3 className="text-xl font-semibold text-stone-950">{history?.diseases?.length ?? '--'}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            {copy.diseaseDesc}
          </p>
          <Link to="/disease" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
            {copy.openScan}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{copy.assistant}</p>
              <h3 className="text-xl font-semibold text-stone-950">{copy.assistantTitle}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm text-stone-600">
            {copy.assistantDesc}
          </p>
          <Link to="/assistant" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-950">
            {copy.askCropMate}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="md:col-span-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-stone-50 p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <CloudRain className="h-5 w-5 text-lime-700" />
                <h4 className="font-bold text-stone-900">{copy.weatherInsight}</h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {language === 'hi' ? `इस सप्ताह कुल ${weather?.forecast.rainfallTotal || 0} मिमी वर्षा की अपेक्षा करें।` : language === 'mr' ? `या आठवड्यात एकूण ${weather?.forecast.rainfallTotal || 0} मिमी पावसाची अपेक्षा करा.` : `Expect ${weather?.forecast.rainfallTotal || 0}mm of cumulative rainfall this week.`} 
                {weather?.forecast.rainfallTotal > 50 ? (language === 'hi' ? ' उच्च नमी का स्तर पाया गया; जल निकासी को प्राथमिकता दें।' : language === 'mr' ? ' ओलावा वाढला आहे; पाण्याचा निचरा करण्यास प्राधान्य द्या.' : ' High moisture levels detected; prioritize drainage.') : (language === 'hi' ? ' छिड़काव और उर्वरक प्रयोग के लिए आदर्श स्थिति।' : language === 'mr' ? ' फवारणी आणि खत प्रयोगासाठी आदर्श परिस्थिती.' : ' Ideal conditions for spraying and fertilizer application.')}
              </p>
            </div>
            
            <div className="rounded-[1.5rem] bg-stone-50 p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <ThermometerSun className="h-5 w-5 text-amber-700" />
                <h4 className="font-bold text-stone-900">{copy.tempWatch}</h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {language === 'hi' ? `दिन का अधिकतम तापमान ${weather?.forecast.temperatureMax || '--'}°C तक पहुँच रहा है।` : language === 'mr' ? `दिवसाचे कमाल तापमान ${weather?.forecast.temperatureMax || '--'}°C पर्यंत पोहोचत आहे.` : `Daytime highs reaching ${weather?.forecast.temperatureMax || '--'}°C.`} 
                {weather?.forecast.temperatureMax > 35 ? (language === 'hi' ? ' मध्यम गर्मी का जोखिम; सुबह जल्दी सिंचाई करें।' : language === 'mr' ? ' मध्यम उष्णतेचा धोका; पहाटे सिंचन करा.' : ' Moderate heat stress risk; irrigate in early mornings.') : (language === 'hi' ? ' स्वस्थ वानस्पतिक विकास के लिए स्थिर तापमान।' : language === 'mr' ? ' निरोगी वाढीसाठी स्थिर तापमान.' : ' Stable temperatures supporting healthy vegetative growth.')}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-stone-50 p-6 border border-stone-100">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="h-5 w-5 text-sky-700" />
                <h4 className="font-bold text-stone-900">{copy.marketTrend}</h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {language === 'hi' ? `मौसमी मांग के कारण ${session?.defaultFarm?.previousCrop || 'प्रमुख फसलों'} के क्षेत्रीय मंडी भाव बढ़ रहे हैं।` : language === 'mr' ? `हंगामी मागणीमुळे ${session?.defaultFarm?.previousCrop || 'प्रमुख पिकांच्या'} प्रादेशिक मंडी दरात वाढ होत आहे.` : `Regional Mandi prices for ${session?.defaultFarm?.previousCrop || 'major crops'} are trending upwards due to seasonal demand.`}
              </p>
            </div>
          </div>

          {loading ? <p className="mt-5 text-sm text-stone-500">{copy.loadingDashboard}</p> : null}
          {error ? <p className="mt-5 text-sm font-semibold text-red-600">{error}</p> : null}
        </Card>
      </div>
    </div>
  )
}
