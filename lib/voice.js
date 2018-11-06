import fs from 'fs'
import path from 'path'
import youtubeStream from 'youtube-audio-stream'
import Promise from 'bluebird'

const readDirAsync = Promise.promisify(fs.readdir)

// Holds the list of samples, and their details, which we'll preload during
// the startup process
let samples = null
let activeConnection = null

export function disconnectIfActiveVoiceConnection () {
  if (activeConnection) {
    activeConnection.disconnect()
    activeConnection = null
  }
}

async function performInVoiceChannel (voiceChannel, operation) {
  // If there's an active connection, kill it and start over:
  disconnectIfActiveVoiceConnection()

  try {
    activeConnection = await voiceChannel.join()
    await operation(activeConnection)
  } finally {
    // Ensure we always leave the voice channel when we're done
    voiceChannel.leave()
  }
}

// Preloads a list of valid samples by looking at a directory and populating
// the global samples list
export async function loadSamples (samplesPath = 'samples') {
  const files = await readDirAsync(samplesPath)

  const newSamples = {}

  files.forEach(file => {
    const filePath = path.parse(file)

    newSamples[filePath.name] = {
      ...filePath,
      path: path.join(samplesPath, file)
    }
  })

  samples = newSamples
}

export function isValidSample (sampleName) {
  return typeof samples[sampleName] !== 'undefined'
}

export function listSamples () {
  return samples ? Object.keys(samples) : []
}

// Wraps the stream dispatcher in a Promise
function dispatcherPromise (dispatcher) {
  return new Promise((resolve, reject) => {
    dispatcher.on('error', err => reject(err))
    dispatcher.on('end', () => resolve())
  })
}

export async function playSampleInVoiceChannel (sampleName, voiceChannel) {
  return performInVoiceChannel(voiceChannel, async connection => {
    const stream = fs.createReadStream(samples[sampleName].path)
    const dispatcher = connection.playStream(stream)

    return dispatcherPromise(dispatcher)
  })
}

export async function playYoutubeInVoiceChannel (videoOptions, voiceChannel) {
  return performInVoiceChannel(voiceChannel, async connection => {
    try {
      const stream = youtubeStream(videoOptions.url)
      const dispatcher = connection.playStream(stream)

      // If there's a time limit, kill the dispatcher after it expires
      if (videoOptions.limit) {
        setTimeout(() => {
          if (dispatcher) {
            dispatcher.end()
          }
        }, Math.min(Math.max(1, videoOptions.limit), 3600) * 1000) // At most one hour can go by, at least 1 second
      }

      return dispatcherPromise(dispatcher)
    } catch (err) {
      console.log(`Failed to play youtube stream for some reason`)
      throw err
    }
  })
}
