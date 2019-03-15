import { openDB } from 'idb'

const STORE_RESTAURANT = 'restaurant'
const STORE_REVIEW = 'review'

const dbPromise = openDB('my-site-db', 1, {
  upgrade(db) {
    db.createObjectStore(STORE_RESTAURANT, { keyPath: 'id' })
    db.createObjectStore(STORE_REVIEW, { keyPath: 'id' })
      .createIndex('restaurant_id', 'restaurant_id', { unique: false });
  }
})

export default class IDBHelper {
  static count() {
    return dbPromise.then(db => db.count(STORE_RESTAURANT))
  }

  static get(id = '') {
    return dbPromise.then(db => (id === '')
      ? db.getAll(STORE_RESTAURANT)
      : db.get(STORE_RESTAURANT, parseInt(id))
    )
  }

  static set(values) {
    return dbPromise.then(db => {
      const promise = values.map(value => {
        const tx = db.transaction(STORE_RESTAURANT, 'readwrite');
        tx.store.put(STORE_RESTAURANT, value);
        return tx.done;
      })

      return Promise.all(promise).then(() => values)
    })
  }

  static setReviews(reviews) {
    return dbPromise.then(db => {
      const promise = reviews.map(value => {
        return db.put(STORE_REVIEW, value);
      })

      return Promise.all(promise).then(() => reviews)
    })
  }

  static countReviews(restaurantId) {
    return dbPromise.then(db => db.countFromIndex(STORE_REVIEW, 'restaurant_id', restaurantId))
  }

  static getReviews(restaurantId) {
    return dbPromise.then(db => db.getAllFromIndex(STORE_REVIEW, 'restaurant_id', restaurantId))
  }
}