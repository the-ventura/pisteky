import { insertIntoTable } from './db'
// import { db } from '../lib'

export const tableHeaders = 'Stats(ID INTEGER PRIMARY KEY ASC, timestamp text, our_score text, their_score text, forfeit integer, overtime integer);'

export async function logStats (args) {
  const { score, o, f, overtime, forfeit } = args
  const [ ourScore, theirScore ] = score.split('-')
  const realOvertime = (o || overtime) || 'false'
  const realForfeit = (f || forfeit) || 'false'

  return insertIntoTable('db/database.db', `Stats (timestamp, our_score, their_score, forfeit, overtime) VALUES("${Date()}", ?, ?, ?, ?)`, [ourScore, theirScore, realOvertime, realForfeit])

  // return (await db).get('SELECT * FROM Stats WHERE ID=(SELECT MAX(ID) FROM Stats)')
}
