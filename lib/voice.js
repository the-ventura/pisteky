import fs from 'fs'
import path from 'path'
import youtubeStream from 'youtube-audio-stream'
import youtubePlaylist from 'youtube-playlist'
import Promise from 'bluebird'
import { maxBy } from 'lodash'
import { usersInVoiceChannel } from './users'

const readDirAsync = Promise.promisify(fs.readdir)

// Holds the list of samples, and their details, which we'll preload during
// the startup process
let samples = null
let activeConnection = null
let activeVoiceChannel = null
let activeDispatcher = null
let activePlaylist = null

// Store a reference to the currently active dispatcher, and setup the necessary
// hooks to keep the reference up to date
function storeDispatcher (dispatcher) {
  // If there's currently an active dispatcher, end it immediately:
  stopActiveDispatcher()

  activeDispatcher = dispatcher

  // Remove the shared reference when the active dispatcher is done:
  dispatcher.on('end', () => {
    activeDispatcher = null
  })

  return dispatcher
}

// If we have an active dispatcher, terminate it and manually ditch our reference for it.
// This can be used as a 'stop sound' method, since that's essentially all it does
export function stopActiveDispatcher () {
  if (activeDispatcher) {
    // If we're going through a playlist at the moment, get rid of its reference;
    // this will cause the playlist reader to stop
    activePlaylist = null

    // We set the volume to 0 before stopping the dispatcher to reduce the chance of audible sound
    // glitching from closing the stream so abruptly
    activeDispatcher.setVolume(0)
    activeDispatcher.end()
    activeDispatcher = null
  }
}

// Forcefully disconnects from the currently active voice channel
export function disconnectIfActiveVoiceConnection () {
  if (activeConnection) {
    activeConnection.disconnect()
    activeConnection = null
  }
}

// Finds the most populated voice channel currently (if any) and joins it
export async function joinPopulatedVoiceChannel (client) {
  const voiceChannels = client.channels.filter(c => c.type === 'voice')
  const populatedChannel = maxBy(voiceChannels.array(), c => usersInVoiceChannel(c).length)

  if (populatedChannel && usersInVoiceChannel(populatedChannel).length > 0) {
    return joinVoiceChannel(populatedChannel)
  } else {
    // If we're already in a voice channel, but couldn't get a good result (all channels are empty),
    // then we leave the current channel:
    if (activeVoiceChannel) {
      activeVoiceChannel.leave()
    }
  }
}

async function joinVoiceChannel (channel) {
  activeVoiceChannel = channel
  activeConnection = await channel.join()

  return activeConnection
}

// Run an operation with the given voice channel, joining it if necessary
async function performInVoiceChannel (voiceChannel, operation) {
  await operation(await joinVoiceChannel(voiceChannel))
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

// Any time someone leaves or joins a voice channel, we evaluate the current state of all
// voice channels, and decide which one the bot should currently join.
export async function handleVoiceStateUpdate (memberBefore, memberAfter) {
  if (memberAfter.voiceChannel && !activeVoiceChannel) {
    // We are not currently in a voice channel, and someone just joined one:
    joinVoiceChannel(memberAfter.voiceChannel)
  } else if (activeVoiceChannel && usersInVoiceChannel(activeVoiceChannel).length === 0) {
    // Our current channel is now empty - evaluate if there's a better replacement channel,
    // or leave altogether
    await joinPopulatedVoiceChannel(memberAfter.client) // We get the client reference from the member that just left
  }
}

export async function playSampleInVoiceChannel (sampleName, voiceChannel) {
  return performInVoiceChannel(voiceChannel, async connection => {
    const stream = fs.createReadStream(samples[sampleName].path)
    const dispatcher = storeDispatcher(connection.playStream(stream))

    return dispatcherPromise(dispatcher)
  })
}

export async function playYoutubePlaylistInVoiceChannel (videoOptions, voiceChannel) {
  activePlaylist = (await youtubePlaylist(videoOptions.url)).data.playlist

  for (const playlistVideo of activePlaylist) {
    const url = `https://youtube.com/watch?v=${playlistVideo['data-video-id']}`

    // If the active playlist has been cleared, stop what we're doing
    if (!activePlaylist) break

    await playYoutubeInVoiceChannel({ url }, voiceChannel)
  }
}

export async function playYoutubeInVoiceChannel (videoOptions, voiceChannel) {
  return performInVoiceChannel(voiceChannel, async connection => {
    const stream = youtubeStream(videoOptions.url)
    const dispatcher = storeDispatcher(connection.playStream(stream))

    // If there's a time limit, kill the dispatcher after it expires
    if (videoOptions.limit) {
      setTimeout(() => {
        stopActiveDispatcher()
      }, Math.min(Math.max(1, videoOptions.limit), 3600) * 1000) // At most one hour can go by, at least 1 second
    }

    return dispatcherPromise(dispatcher)
  })
}
