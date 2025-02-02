import React, { useState, useEffect, useRef } from 'react'
import { FaPlus, FaMinus, FaCheck, FaEye, FaEyeSlash, FaArrowLeft, FaHome, FaRedo } from 'react-icons/fa'
import { saveClicks, getClicks } from '../db.js'

export default function ImageInteraction({ image, onBack, onSaveClicks }) {
  const [mode, setMode] = useState('add')
  const [points, setPoints] = useState([])
  const [heatmap, setHeatmap] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [clicks, setClicks] = useState([])
  const canvasRef = useRef()
  const imgRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = image.url
    imgRef.current = img

    getClicks(image.id).then(clicks => {
      setClicks(clicks)
      if (clicks.length > 0) {
        const heatmapInstance = window.h337.create({
          container: canvas.parentElement,
          radius: 40
        })
        heatmapInstance.setData({
          max: 10,
          data: clicks.map(([x, y]) => ({ x, y, value: 1 }))
        })
        setHeatmap(heatmapInstance)
      }
    })
  }, [image])

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === 'add' && points.length < 3) {
      setPoints(prev => [...prev, { x, y }])
    } else if (mode === 'remove') {
      setPoints(prev => prev.filter(p => 
        Math.sqrt((p.x - x)**2 + (p.y - y)**2) > 20
      ))
    }
  }

  const handleSubmit = async () => {
    await onSaveClicks(image.id, points.map(p => [p.x, p.y]))
    setClicks(prev => [...prev, ...points.map(p => [p.x, p.y])])
    setPoints([])
  }

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap)
    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.drawImage(imgRef.current, 0, 0)

    if (!showHeatmap && heatmap) {
      heatmap.repaint()
    } else if (!showHeatmap) {
      clicks.forEach(([x, y]) => {
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }

  const handleReset = () => {
    setPoints([])
  }

  return (
    <div className="image-container">
      <div className="controls">
        <button onClick={() => setMode('add')} className={mode === 'add' ? 'active' : ''}>
          <FaPlus /> Add
        </button>
        <button onClick={() => setMode('remove')} className={mode === 'remove' ? 'active' : ''}>
          <FaMinus /> Remove
        </button>
        <button onClick={handleSubmit} disabled={points.length !== 3}>
          <FaCheck /> Submit
        </button>
        <button onClick={toggleHeatmap}>
          {showHeatmap ? <FaEyeSlash /> : <FaEye />} {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>
        <button onClick={handleReset}>
          <FaRedo /> Reset
        </button>
        <button onClick={onBack} className="back-button">
          <FaArrowLeft /> Back
        </button>
        <button onClick={() => window.location.reload()} className="home-button">
          <FaHome /> Home
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} onClick={handleCanvasClick} />
        {(mode === 'remove' || !showHeatmap) && points.map((p, i) => (
          <div 
            key={i}
            className="click-marker"
            style={{ left: p.x - 10, top: p.y - 10 }}
          />
        ))}
      </div>
    </div>
  )
}
