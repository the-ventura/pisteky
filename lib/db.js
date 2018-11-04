import sqlite from 'sqlite'
import Promise from 'bluebird'

export async function connectDatabase (dbName) {
  return sqlite.open(dbName, { Promise })
}

export async function createTable (dbPath, tableParameters) {
  const db = await connectDatabase(dbPath)
  await db.run('create table if not exists ' + tableParameters)
  db.close()
}

export async function insertIntoTable (dbPath, tableName, dataParameters) {
  const db = await connectDatabase(dbPath)
  await db.run('insert into ' + tableName, dataParameters)
  db.close()
}
