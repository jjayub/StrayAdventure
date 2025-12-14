import { useEffect, useState } from 'react'
import { useGame } from './stores/useGame'

// Define MapInfo type locally
interface MapInfo {
  id: string
  name: string
  description: string
  preview: string
  scene: string
}

/**
 * MapSelection Component
 * หน้าเลือก Map ก่อนเริ่มเกม
 * - สแกนโฟลเดอร์ maps/ อัตโนมัติ
 * - แสดง Preview ของแต่ละ Map
 * - เพิ่ม Map ใหม่ได้
 */
export function MapSelection() {
  const { availableMaps, setAvailableMaps, selectMap, startGame, goToMenu } = useGame()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMap, setShowAddMap] = useState(false)

  // โหลดรายการ Maps จาก Server
  const loadMaps = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/maps')
      if (response.ok) {
        const data = await response.json()
        setAvailableMaps(data.maps || [])
      } else {
        // Fallback to static file
        const staticResponse = await fetch('/maps/maps.json')
        const data = await staticResponse.json()
        setAvailableMaps(data.maps || [])
      }
    } catch {
      // Fallback to static file
      try {
        const staticResponse = await fetch('/maps/maps.json')
        const data = await staticResponse.json()
        setAvailableMaps(data.maps || [])
      } catch (error) {
        console.error('Failed to load maps:', error)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadMaps()
  }, [])

  const handleSelectMap = (map: MapInfo, index: number) => {
    setSelectedIndex(index)
    selectMap(map)
  }

  const handleStartGame = () => {
    if (availableMaps[selectedIndex]) {
      selectMap(availableMaps[selectedIndex])
      startGame()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 2000,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      {/* Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("/menu-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.5) saturate(1.2)',
      }} />

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,255,255,0.1) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px',
        boxSizing: 'border-box',
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          color: '#00ffff',
          textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
          marginBottom: '40px',
          letterSpacing: '8px',
        }}>
          SELECT MAP
        </h1>

        {/* Maps Grid */}
        <div style={{
          flex: 1,
          width: '100%',
          maxWidth: '1400px',
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          alignContent: 'flex-start',
          flexWrap: 'wrap',
          overflowY: 'auto',
          padding: '20px',
        }}>
          {isLoading ? (
            <p style={{ color: '#fff', fontSize: '24px' }}>Loading maps...</p>
          ) : (
            <>
              {availableMaps.map((map, index) => (
                <MapCard
                  key={map.id}
                  map={map}
                  isSelected={selectedIndex === index}
                  onClick={() => handleSelectMap(map, index)}
                />
              ))}
              {/* Add Map Card */}
              <AddMapCard onClick={() => setShowAddMap(true)} />
            </>
          )}
        </div>

        {/* Bottom Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '30px',
        }}>
          <button
            onClick={goToMenu}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              fontFamily: "'Rajdhani', sans-serif",
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              letterSpacing: '2px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#fff'
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
          >
            ← BACK
          </button>

          <button
            onClick={handleStartGame}
            disabled={availableMaps.length === 0}
            style={{
              padding: '15px 50px',
              fontSize: '20px',
              fontWeight: 'bold',
              fontFamily: "'Rajdhani', sans-serif",
              color: '#000',
              background: 'linear-gradient(90deg, #00ffff, #00ff88)',
              border: 'none',
              borderRadius: '8px',
              cursor: availableMaps.length > 0 ? 'pointer' : 'not-allowed',
              letterSpacing: '3px',
              transition: 'all 0.3s ease',
              opacity: availableMaps.length > 0 ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (availableMaps.length > 0) {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 0 30px #00ffff'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ▶ PLAY
          </button>
        </div>
      </div>

      {/* Add Map Modal */}
      {showAddMap && (
        <AddMapModal
          onClose={() => setShowAddMap(false)}
          onMapAdded={() => {
            setShowAddMap(false)
            loadMaps()
          }}
        />
      )}
    </div>
  )
}

/**
 * Add Map Card - ปุ่มเพิ่ม Map ใหม่
 */
function AddMapCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: '320px',
        height: '240px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        border: '3px dashed rgba(0,255,255,0.5)',
        background: 'rgba(0,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#00ffff'
        e.currentTarget.style.background = 'rgba(0,255,255,0.15)'
        e.currentTarget.style.transform = 'scale(1.02)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,255,255,0.5)'
        e.currentTarget.style.background = 'rgba(0,255,255,0.05)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <div style={{
        fontSize: '60px',
        color: '#00ffff',
        marginBottom: '10px',
      }}>
        +
      </div>
      <div style={{
        fontSize: '18px',
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        color: '#00ffff',
        letterSpacing: '2px',
      }}>
        ADD MAP
      </div>
    </div>
  )
}

/**
 * Add Map Modal - Modal สำหรับเพิ่ม Map ใหม่
 */
function AddMapModal({
  onClose,
  onMapAdded
}: {
  onClose: () => void
  onMapAdded: () => void
}) {
  const [mapName, setMapName] = useState('')
  const [mapDescription, setMapDescription] = useState('')
  const [configFile, setConfigFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async () => {
    if (!mapName.trim()) {
      setError('Please enter a map name')
      return
    }
    if (!configFile) {
      setError('Please select a config.json file')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('name', mapName)
      formData.append('description', mapDescription || 'Custom map')
      formData.append('config', configFile)

      const response = await fetch('http://localhost:3000/api/maps/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        onMapAdded()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to upload map')
      }
    } catch {
      setError('Server not available. Please check if the server is running.')
    }

    setIsUploading(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a14, #1a1a2e)',
          padding: '40px',
          borderRadius: '16px',
          border: '2px solid #00ffff',
          boxShadow: '0 0 40px rgba(0,255,255,0.3)',
          width: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          color: '#00ffff',
          fontSize: '28px',
          fontFamily: "'Orbitron', sans-serif",
          marginBottom: '30px',
          textAlign: 'center',
          textShadow: '0 0 10px #00ffff',
        }}>
          ➕ ADD NEW MAP
        </h2>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Map Name */}
          <div>
            <label style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Map Name *
            </label>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              placeholder="Enter map name"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Description
            </label>
            <textarea
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              placeholder="Enter map description"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Config File */}
          <div>
            <label style={{ color: '#fff', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Config File (config.json) *
            </label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setConfigFile(e.target.files?.[0] || null)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Info Box */}
          <div style={{
            background: 'rgba(0,255,255,0.1)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <h4 style={{ color: '#00ffff', margin: '0 0 10px 0', fontSize: '14px' }}>
              📸 Auto Preview Generation
            </h4>
            <p style={{ color: '#aaa', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
              The server will automatically capture a preview image from your map
              when you upload it. No need to provide a separate image!
            </p>
          </div>

          {/* Config Template */}
          <div style={{
            background: 'rgba(255,0,128,0.1)',
            border: '1px solid rgba(255,0,128,0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <h4 style={{ color: '#ff0080', margin: '0 0 10px 0', fontSize: '14px' }}>
              📄 Config.json Template
            </h4>
            <pre style={{
              color: '#ccc',
              fontSize: '11px',
              margin: 0,
              overflow: 'auto',
              background: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '4px',
            }}>
              {`{
  "id": "my-map",
  "name": "My Custom Map",
  "skyConfig": {
    "sunPosition": [100, 20, 100]
  },
  "lighting": {
    "ambient": 1.2,
    "neonLights": [
      { "position": [-3, 3, 3], "color": "#ff0080", "intensity": 30 }
    ]
  },
  "spawnPoint": [0, 1, 0],
  "objects": [
    { "type": "box", "position": [5, 0, -5], "size": [1, 1, 1] }
  ]
}`}
            </pre>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(255,0,0,0.2)',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              padding: '12px',
              color: '#ff6666',
              fontSize: '14px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#000',
                background: 'linear-gradient(90deg, #00ffff, #00ff88)',
                border: 'none',
                borderRadius: '8px',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.7 : 1,
              }}
            >
              {isUploading ? 'UPLOADING...' : 'UPLOAD MAP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * MapCard Component
 * การ์ดแสดง Preview ของ Map
 */
function MapCard({
  map,
  isSelected,
  onClick
}: {
  map: MapInfo
  isSelected: boolean
  onClick: () => void
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      onClick={onClick}
      style={{
        width: '320px',
        height: '240px',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        border: isSelected ? '3px solid #00ffff' : '3px solid transparent',
        boxShadow: isSelected
          ? '0 0 30px rgba(0,255,255,0.5), inset 0 0 30px rgba(0,255,255,0.1)'
          : '0 5px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.7)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)'
        }
      }}
    >
      {/* Preview Image */}
      {!imageError ? (
        <img
          src={map.preview}
          alt={map.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '48px',
        }}>
          🗺️
        </div>
      )}

      {/* Overlay Gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
      }} />

      {/* Map Info */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '15px',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '22px',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          color: isSelected ? '#00ffff' : '#fff',
          textShadow: isSelected ? '0 0 10px #00ffff' : 'none',
        }}>
          {map.name}
        </h3>
        <p style={{
          margin: '5px 0 0 0',
          fontSize: '12px',
          color: '#aaa',
          lineHeight: 1.3,
        }}>
          {map.description}
        </p>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#00ffff',
          color: '#000',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          SELECTED
        </div>
      )}
    </div>
  )
}
