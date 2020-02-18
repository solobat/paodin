import Dexie from 'dexie';

const db = new Dexie('paodin');

db.version(1).stores({
  sentence: '++id,tags,trans,text,sentences,from,to,source'
});

export default db;