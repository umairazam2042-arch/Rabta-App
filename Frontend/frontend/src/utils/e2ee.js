// End-to-end encryption: browser ki apni Web Crypto API, koi package nahi.
// Private key IndexedDB mein rehti hai aur nikali nahi ja sakti (extractable: false).

const DB_NAME = 'rabta-e2ee'
const STORE = 'keys'
const LOCKED_TEXT = 'Locked message: ye is device par nahi khul sakta'

const subtle = window.crypto?.subtle

const toB64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)))
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const dbGet = async (key) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const dbSet = async (key, value) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const pendingKeys = new Map()

// Is browser mein user ki key jodi: pehle se ho to wahi, warna nayi
export const ensureKeys = (userId) => {
  if (!subtle) {
    return Promise.reject(new Error('Secure chat ke liye HTTPS ya localhost zaroori hai'))
  }

  if (!pendingKeys.has(userId)) {
    const task = (async () => {
      const saved = await dbGet(userId)
      if (saved?.privateKey && saved?.publicKey) return saved

      const pair = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, [
        'deriveBits',
      ])
      const raw = await subtle.exportKey('raw', pair.publicKey)
      const keys = { privateKey: pair.privateKey, publicKey: toB64(raw) }
      await dbSet(userId, keys)
      return keys
    })()

    task.catch(() => pendingKeys.delete(userId))
    pendingKeys.set(userId, task)
  }

  return pendingKeys.get(userId)
}

const chatKeys = new Map()

const deriveChatKey = async (myId, otherPublicKey) => {
  const { privateKey } = await ensureKeys(myId)

  const theirKey = await subtle.importKey(
    'raw',
    fromB64(otherPublicKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )

  const bits = await subtle.deriveBits({ name: 'ECDH', public: theirKey }, privateKey, 256)
  const hkdfKey = await subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey'])

  return subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(32),
      info: new TextEncoder().encode('rabta-chat-v1'),
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Doosre ki public key na ho to null
export const getChatKey = (myId, otherPublicKey) => {
  if (!otherPublicKey) return Promise.resolve(null)

  const id = `${myId}:${otherPublicKey}`
  if (!chatKeys.has(id)) {
    chatKeys.set(
      id,
      deriveChatKey(myId, otherPublicKey).catch(() => {
        chatKeys.delete(id)
        return null
      })
    )
  }
  return chatKeys.get(id)
}

export const encryptText = async (plainText, chatKey) => {
  if (!chatKey) throw new Error('Is user ne abhi secure chat on nahi kiya. Unhein ek baar login karna hoga.')

  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const cipher = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    chatKey,
    new TextEncoder().encode(plainText)
  )
  return { text: toB64(cipher), iv: toB64(iv) }
}

// iv khali ho to text pehle se plain hai (jaise "delete ho gaya" wala text)
export const decryptText = async (text, iv, chatKey) => {
  if (!iv) return text
  if (!chatKey) return LOCKED_TEXT

  try {
    const plain = await subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, chatKey, fromB64(text))
    return new TextDecoder().decode(plain)
  } catch {
    return LOCKED_TEXT
  }
}

export const decryptMessage = async (message, chatKey) => ({
  ...message,
  text: await decryptText(message.text, message.iv, chatKey),
})

export const decryptLastMessage = async (myId, otherUser, lastMessage) => {
  const key = await getChatKey(myId, otherUser?.publicKey)
  return { ...lastMessage, text: await decryptText(lastMessage.text, lastMessage.iv, key) }
}