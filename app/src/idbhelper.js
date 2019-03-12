import { openDb } from 'idb'

const STORE_RESTAURANT = 'restaurant'
const dbPromise = openDb('my-site-db', 1, upgradeDB => {
  upgradeDB.createObjectStore(STORE_RESTAURANT, { keyPath: 'id' })
})

export default class IDBHelper {
  static count() {
    return dbPromise.then(db => {
      const store = db.transaction(STORE_RESTAURANT, 'readonly').objectStore(STORE_RESTAURANT)
      return store.count()
    })
  }

  static get(id = '') {
    return dbPromise.then(db => {
      const store = db.transaction(STORE_RESTAURANT).objectStore(STORE_RESTAURANT)
      return (id === '')
        ? store.getAll()
        : store.get(parseInt(id))
    })
  }

  static set(values) {
    return dbPromise.then(db => {
      const promise = values.map(value => {
        const tx = db.transaction(STORE_RESTAURANT, 'readwrite');
        tx.objectStore(STORE_RESTAURANT).put(value);
        return tx.complete;
      })

      return Promise.all(promise).then(() => values)
    })
  }
}