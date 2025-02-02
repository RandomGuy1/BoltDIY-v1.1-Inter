import { v4 as uuidv4 } from 'uuid'

const DB_NAME = 'ImageClickDB'
const STORE_IMAGES = 'images'
const STORE_CLICKS = 'clicks'

export const initDB = () => new Promise((resolve) => {
  const request = indexedDB.open(DB_NAME, 1)
  
  request.onupgradeneeded = (e) => {
    const db = e.target.result
    db.createObjectStore(STORE_IMAGES, { keyPath: 'id' })
    db.createObjectStore(STORE_CLICKS, { keyPath: 'imageId' })
  }

  request.onsuccess = () => resolve()
})

export const storeImage = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = async (e) => {
    const image = {
      id: uuidv4(),
      url: e.target.result,
      name: file.name,
      clicks: 0
    }
    
    const db = await getDB()
    const tx = db.transaction(STORE_IMAGES, 'readwrite')
    tx.objectStore(STORE_IMAGES).put(image)
    tx.oncomplete = () => resolve(image)
  }
  reader.readAsDataURL(file)
})

export const getImages = () => new Promise((resolve) => {
  getDB().then(db => {
    const tx = db.transaction(STORE_IMAGES, 'readonly')
    const request = tx.objectStore(STORE_IMAGES).getAll()
    request.onsuccess = () => resolve(request.result)
  })
})

export const saveClicks = (imageId, clicks) => new Promise((resolve) => {
  getDB().then(db => {
    const tx = db.transaction([STORE_IMAGES, STORE_CLICKS], 'readwrite')
    const imageStore = tx.objectStore(STORE_IMAGES)
    const clickStore = tx.objectStore(STORE_CLICKS)

    imageStore.get(imageId).onsuccess = (e) => {
      const image = e.target.result
      image.clicks += clicks.length
      imageStore.put(image)
    }

    clickStore.put({ imageId, clicks })
    tx.oncomplete = resolve
  })
})

export const getClicks = (imageId) => new Promise((resolve) => {
  getDB().then(db => {
    const tx = db.transaction(STORE_CLICKS, 'readonly')
    const request = tx.objectStore(STORE_CLICKS).get(imageId)
    request.onsuccess = () => resolve(request.result?.clicks || [])
  })
})

const getDB = () => new Promise((resolve) => {
  const request = indexedDB.open(DB_NAME)
  request.onsuccess = () => resolve(request.result)
})
