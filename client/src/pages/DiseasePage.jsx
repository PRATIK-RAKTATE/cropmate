import { useState, useRef, useEffect } from 'react'
import { Button, Card, Input, Label, PageHeader, Select } from '../components/Ui.jsx'
import { useAppContext } from '../context/AppContext.jsx'
import { api } from '../services/api.js'
import { riskTone } from '../utils/format.js'
import { Camera, Upload, X, Loader2, Sparkles } from 'lucide-react'

export function DiseasePage() {
  const { session } = useAppContext()
  const [crop, setCrop] = useState('tomato')
  const [image, setImage] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  async function startCamera() {
    setIsCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setMessage('Could not access camera. Please check permissions.')
      setIsCameraActive(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setIsCameraActive(false)
  }

  async function capturePhoto() {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))
    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
    setImage(file)
    stopCamera()
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('farmerId', session.farmer._id)
      formData.append('farmId', session.defaultFarm._id)
      formData.append('crop', crop)
      formData.append('image', image)

      const result = await api.detectDisease(formData)
      setReport(result)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Disease scan"
        title="Upload a crop image"
        description="Leaf analysis uses a hosted vision API. If the provider is not configured, CropMate returns a controlled setup error instead of guessing."
      />

      <div className="grid gap-5 p-5 md:grid-cols-[0.48fr_0.52fr] md:p-8">
        <Card className="flex flex-col">
          <div className="mb-6 flex gap-2">
            <button 
              onClick={() => { stopCamera(); setIsCameraActive(false) }}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${!isCameraActive ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-600'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-3.5 h-3.5" />
                Upload File
              </div>
            </button>
            <button 
              onClick={startCamera}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all ${isCameraActive ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-600'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </div>
            </button>
          </div>

          <form className="grid gap-6 flex-1" onSubmit={handleSubmit}>
            <div>
              <Label>Crop Type</Label>
              <Select value={crop} onChange={(event) => setCrop(event.target.value)}>
                <option value="tomato">Tomato</option>
                <option value="potato">Potato</option>
                <option value="chili">Chili</option>
                <option value="soybean">Soybean</option>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Leaf Image Source</Label>
              {isCameraActive ? (
                <div className="relative aspect-square rounded-2xl bg-black overflow-hidden group">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 w-full px-4">
                    <Button 
                      type="button"
                      onClick={capturePhoto}
                      variant="secondary"
                      className="flex-1 py-3 flex items-center justify-center gap-2 shadow-xl"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 ${image ? 'border-lime-500 bg-lime-50/30' : 'border-stone-200 bg-stone-50'}`}>
                  {image ? (
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto bg-lime-100 rounded-2xl flex items-center justify-center mb-4 text-lime-600">
                        <Sparkles className="w-10 h-10" />
                      </div>
                      <p className="text-sm font-bold text-stone-900">{image.name}</p>
                      <button 
                        type="button"
                        onClick={() => setImage(null)}
                        className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-stone-400 mb-4" />
                      <p className="text-sm text-stone-500 text-center">Drag and drop or click to select a leaf image</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(event) => setImage(event.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              variant="secondary" 
              className="w-full py-4 text-sm uppercase tracking-widest font-black"
              disabled={loading || !image}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </div>
              ) : 'Start Detection'}
            </Button>
            {message ? <p className="text-sm font-semibold text-red-600 text-center">{message}</p> : null}
          </form>
        </Card>

        <Card>
          {report ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Detected issue</p>
                  <h2 className="mt-2 text-3xl font-semibold text-stone-950">{report.disease}</h2>
                </div>
                <div className={`rounded-full px-3 py-2 text-xs font-semibold ${riskTone(report.severity)}`}>
                  {report.severity}
                </div>
              </div>
              <p className="mt-4 text-sm text-stone-600">
                Confidence {report.confidence}% • Provider {report.provider}
              </p>
              
              {report.explanation && (
                <div className="mt-6 border-l-4 border-emerald-500 bg-emerald-50 p-5 rounded-r-2xl">
                  <p className="text-emerald-950 font-medium leading-relaxed italic">
                    "{report.explanation}"
                  </p>
                </div>
              )}

              <p className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                <span className="font-semibold block mb-1 uppercase text-[10px] tracking-wider text-stone-500">The Cause</span>
                {report.cause}
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  ['Immediate action', report.immediateAction],
                  ['Organic treatment', report.organicTreatment],
                  ['Chemical treatment', report.chemicalTreatment],
                  ['Prevention tips', report.preventionTips],
                ].map(([label, items]) => (
                  <div key={label} className="rounded-2xl bg-stone-50 p-4">
                    <p className="font-semibold text-stone-950">{label}</p>
                    <ul className="mt-3 list-disc pl-5 text-sm text-stone-700">
                      {items?.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No extra guidance.</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-600">
              Upload a leaf image to see disease name, confidence, severity, treatments, and prevention.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
