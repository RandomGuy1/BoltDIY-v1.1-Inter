import React, { useEffect, useState } from 'react'
import { FaUpload, FaCheckCircle } from 'react-icons/fa'
import { getClicks } from '../db.js'

export default function HomePage({ images, onUpload, onSelect }) {
  const [completedImages, setCompletedImages] = useState([])

  useEffect(() => {
    const fetchCompletedImages = async () => {
      const completed = await Promise.all(
        images.map(async (img) => {
          const clicks = await getClicks(img.id)
          return clicks.length > 0 ? img.id : null
        })
      )
      setCompletedImages(completed.filter(Boolean))
    }
    fetchCompletedImages()
  }, [images])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) onUpload(file)
  }

  return (
    <div className="container">
      <h1>Image Click Analytics</h1>
      <label className="upload-btn">
        <FaUpload /> Upload New Image
        <input type="file" hidden onChange={handleUpload} />
      </label>
      
      <div className="gallery">
        {images.map(img => (
          <div key={img.id} className="thumb" onClick={() => onSelect(img)}>
            <img src={img.url} alt="Uploaded" />
            {completedImages.includes(img.id) && (
              <FaCheckCircle className="checkmark" />
            )}
            <span>{img.clicks} clicks</span>
          </div>
        ))}
      </div>
    </div>
  )
}
