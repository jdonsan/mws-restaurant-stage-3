/**
 * Common sw helper functions.
 */
export default class SWHelper {

	/**
	 * Install Service Worker.
	 */
  static install() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered!!'))
        .catch(error => console.log('Error registering sw. Reason:', error))
    }
  }

}

