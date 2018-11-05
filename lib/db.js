import sqlite from 'sqlite'
import Promise from 'bluebird'
import { db } from '../lib'

export async function connectDatabase (dbName) {
  return sqlite.open(dbName, { Promise })
}

export async function createTable (dbPath, tableParameters) {
  const db = await connectDatabase(dbPath)
  await db.run(`create table if not exists ${tableParameters}`)

  return db
}

export async function insertIntoTable (tableName, dataParameters) {
  (await db).run(`insert into ${tableName}`, dataParameters)
}
