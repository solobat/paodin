import Dexie from 'dexie'

const DB_NAME = 'paodin'
const db = new Dexie(DB_NAME);
const MIN_VERSION = 2
const DB_VERSION = 'db_version'
const version = Number(localStorage.getItem(DB_VERSION)) || 1
const hasDB = localStorage.getItem(DB_VERSION) !== null
const schema = {
  sentence: '++id,tags,trans,text,sentences,from,to,source,synced'
}

async function changeSchema(db, schemaChanges) {
  db.close()
  const newDb = new Dexie(db.name)

  newDb.on('blocked', () => false)

  if (db.tables.length === 0) {
    await db.delete()

    newDb.version(MIN_VERSION).stores(schemaChanges)

    return await newDb.open()
  }

  const currentSchema = db.tables.reduce((result, { name, schema }) => {
    result[name] = [
      schema.primKey.src,
      ...schema.indexes.map(idx => idx.src)
    ].join(',');
    return result;
  }, {});

  newDb.version(db.verno).stores(currentSchema)

  const newVerno = db.verno + 1
  
  localStorage.setItem(DB_VERSION, newVerno)
  newDb.version(newVerno).stores(schemaChanges)

  return await newDb.open();
}

async function dbUpdate() {
  let db = new Dexie(DB_NAME);

  if (!(await Dexie.exists(db.name))) {
    console.log("Db does not exist");
  }

  await db.open();

  db = await changeSchema(db, schema);
}

export async function checkDB() {
  if (hasDB && version < MIN_VERSION) {
    console.log('db should update...')
    await dbUpdate()
    
    window.location.reload()
  } else {
    initDB()
  }
}

export function initDB() {
  console.log("checkDB -> hasDB", hasDB)
  db.version(MIN_VERSION).stores(schema);
  localStorage.setItem(DB_VERSION, MIN_VERSION)
}

export default db;