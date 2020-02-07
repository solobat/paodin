import db from '../db'

export function list() {
  return db.sentence.toArray()
}

export async function save(attrs) {
  const { text } = attrs
  const result = await db.sentence.get({
    text
  })

  if (result) {
    return db.sentence.update(result.id, attrs)
  } else {
    return db.sentence.put(attrs)
  }
}

export function query({scope, query }) {
  return db.sentence.toArray()
}

export function del(id) {
  return db.sentence.delete(id)
}