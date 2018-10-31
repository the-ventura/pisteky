import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'

const readDirAsync = Promise.promisify(fs.readdir)

// Holds the list of samples, and their details, which we'll preload during
// the startup process
let samples = null

async function performInVoiceChannel (voiceChannel, operation) {
  try {
    const connection = await voiceChannel.join()
    await operation(connection)
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

export async function playSampleInVoiceChannel (sampleName, voiceChannel) {
  return performInVoiceChannel(voiceChannel, async (connection) => {
    const stream = fs.createReadStream(samples[sampleName].path)
    const dispatcher = connection.playStream(stream)

    return new Promise((resolve, reject) => {
      dispatcher.on('error', err => reject(err))
      dispatcher.on('end', () => resolve())
    })
  })
}
