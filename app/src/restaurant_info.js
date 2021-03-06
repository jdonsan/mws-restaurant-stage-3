import DBHelper from './dbhelper'
import SWHelper from './swhelper'
import L from 'leaflet'

var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  SWHelper.install();
  initMap();
  initEvents();
});

/**
 * Initialize leaflet map
 */
function initMap() {
  fetchRestaurantFromURL()
    .then(restaurant => {
      newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiamRvbnNhbiIsImEiOiJjanFycjIxcW4wbzBkNDhtZDUwbTZobjlqIn0.kEudKiNOT9o9uXZi5AIBPg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb(restaurant);
      DBHelper.mapMarkerForRestaurant(restaurant, newMap);
    })
    .then(fetchReviewsFromUrl())
    .catch(console.error)
}

function initEvents() {
  document.getElementById('reviews-add-button').addEventListener("click", onOpenDialog)
  document.getElementById('dialog-new-review-close').addEventListener("click", onCloseDialog)
  document.getElementById('dialog-new-review-form').addEventListener("submit", onSaveReview)
  document.getElementById('restaurant-favorite'), addEventListener('change', onToggleFavorite)
  window.addEventListener("online", onOnline)
  window.addEventListener("offline", onOffline)
}

function onOpenDialog() {
  document.getElementById('dialog-new-review').classList.remove("close");
}

function onCloseDialog() {
  document.getElementById('dialog-new-review').classList.add("close");
}

function onToggleFavorite(event) {
  const id = getParameterByName('id')
  DBHelper.setFavourite(parseInt(id), event.target.checked)
}

function onOnline() {
  const id = getParameterByName('id')

  DBHelper.fetchReviewsOffline(parseInt(id))
    .then(reviews => Promise.all(reviews.map(review => DBHelper.saveReview(review))))
    .then(fetchReviewsFromUrl)
    .catch(console.log)

  DBHelper.fetchRestaurantOffline(parseInt(id))
    .then(restaurant => restaurant && DBHelper.setFavourite(parseInt(id), restaurant.is_favorite))
    .catch(console.log)
}

function onOffline() {
  document.getElementById('modal-warning').classList.remove("close");
  setTimeout(() => {
    document.getElementById('modal-warning').classList.add("close");
  }, 3000)
}

function onSaveReview(event) {
  event.preventDefault()
  const review = {
    restaurant_id: parseInt(getParameterByName('id')),
    name: document.getElementById('username').value,
    rating: parseInt(document.getElementById('rating').value),
    comments: document.getElementById('comment').value
  }

  DBHelper.saveReview(review)
    .then(showNewReview)
    .catch(console.log)
}

function showNewReview() {
  fetchReviewsFromUrl()
  onCloseDialog()
  window.scrollTo(0, document.body.scrollHeight)
}

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL() {
  return new Promise((resolve, reject) => {
    const id = getParameterByName('id')

    if (!id) {
      return reject('No restaurant id in URL')
    }

    DBHelper.fetchRestaurantById(id)
      .then(restaurant => {
        if (!restaurant) return reject('No exist this restaurant with this id')

        fillRestaurantHTML(restaurant)
        resolve(restaurant)
      })
      .catch(error => reject(error))

  })
}

function fetchReviewsFromUrl() {
  return new Promise((resolve, reject) => {
    const restaurantId = getParameterByName('id')

    if (!restaurantId) {
      return reject('No restaurant id in URL')
    }

    DBHelper.fetchReviews(parseInt(restaurantId)).then(reviews => {
      fillReviewsHTML(reviews)
      resolve(reviews)
    })
      .catch(error => reject(error))

  })
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant) {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = 'Restaurant ' + restaurant.name
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  const favorite = document.getElementById('restaurant-favorite');
  favorite.checked = (restaurant.is_favorite === 'true');

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML(restaurant.operating_hours);
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews) {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.id = 'message-no-reviews'
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  } else {
    const msg = document.getElementById('message-no-reviews')
    if (msg) {
      msg.remove()
    }
  }

  const ul = document.getElementById('reviews-list');
  ul.innerHTML = ''

  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
  const li = document.createElement('li');

  li.appendChild(createHeaderReviewHTML(review));
  li.appendChild(createBodyReviewHTML(review));

  return li;
}

function createHeaderReviewHTML(review) {
  const h3 = document.createElement('h3')

  const name = document.createElement('span');
  name.innerHTML = review.name;
  h3.appendChild(name);

  const date = document.createElement('span');
  if (!review.createdAt) {
    date.classList.add('pending')
    date.innerHTML = 'Pending sync'
  } else {
    date.innerHTML = new Date(review.createdAt).toLocaleDateString('en-EN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  h3.appendChild(date);

  return h3;
}

function createBodyReviewHTML(review) {
  const div = document.createElement('div');

  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  div.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  div.appendChild(comments);

  return div;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
