import React, { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import ImageInteraction from './components/ImageInteraction'
import { initDB, getImages, storeImage, saveClicks } from './db.js'

export default function App() {
  const [images, setImages] = useState([])
  const [currentImage, setCurrentImage] = useState(null)

  useEffect(() => {
    initDB().then(() => getImages().then(setImages))
  }, [])

  const handleSaveClicks = async (imageId, points) => {
    await saveClicks(imageId, points)
    setImages(prevImages => prevImages.map(img => 
      img.id === imageId ? { ...img, clicks: img.clicks + points.length } : img
    ))
    setCurrentImage(null)
  }

  return currentImage ? (
    <ImageInteraction 
      image={currentImage} 
      onBack={() => setCurrentImage(null)}
      onSaveClicks={handleSaveClicks}
    />
  ) : (
    <HomePage 
      images={images}
      onUpload={async (file) => {
        const image = await storeImage(file)
        setImages(prev => [...prev, image])
      }}
      onSelect={setCurrentImage}
    />
  )
}
