import { connectDatabase, insertIntoTable } from './db'

export const tableHeaders = 'Stats(timestamp text, our_score text, their_score text, forfeit integer, overtime integer);'

export async function logStats (args) {
  const { score, o, f, overtime, forfeit } = args
  const [ ourScore, theirScore ] = score.split('-')
  const realOvertime = (o || overtime) || 'false'
  const realForfeit = (f || forfeit) || 'false'

  await insertIntoTable('db/database.db', `Stats VALUES("${Date()}", ?, ?, ?, ?)`, [ourScore, theirScore, realOvertime, realForfeit])

  const db = await connectDatabase('db/database.db')
  return db.get('SELECT * FROM Stats ORDER BY timestamp DESC LIMIT 1')
}
