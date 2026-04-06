function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
}

function checkauthentification() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  if (!token) {
    window.location.href = 'login.html';
    return null;
  } else {
    if (loginLink) {
      loginLink.style.display = 'none';
    }
    fetchPlaces(token);
    return token;
  }
}

async function fetchPlaces(token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
    headers
  });
  const data = await response.json();
  displayPlaces(data);
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';
  places.forEach(place => {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
      <h2>${place.title}</h2>
      <p>Price: $${place.price} per night</p>
      <p>${place.description}</p>
      <a href="place.html?id=${place.id}" class="details-button">View Details</a>
    `;
    card.dataset.price = place.price;
    placesList.appendChild(card);
  })
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function checkAuthentificationPlace() {
  const token = getCookie('token');
  const addReviewSection = document.getElementById('add-review');
  const placeId = getPlaceIdFromURL();
  fetchPlacesDetails(token, placeId);
  if (!token) {
    if (addReviewSection) {
      addReviewSection.style.display = 'none';
    }
  } else {
    if (addReviewSection) {
      addReviewSection.style.display = 'block';
    }
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const reviewText = document.getElementById('review-text').value;
        const rating = document.getElementById('rating').value;
        await submitReview(token, placeId, reviewText, rating);
      });
    }
  }
}

async function fetchPlacesDetails(token, placeId) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
    headers
  });
  const data = await response.json();
  displayPlaceDetails(data);
  const reviews = await fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}`, {
    headers
  });
  const reviewsData = await reviews.json();
  displayReviews(reviewsData);
}

function displayPlaceDetails(place) {
  const placeDetails = document.getElementById('place-details');
  placeDetails.innerHTML = `
        <div class="place-details">
          <h2>${place.title}</h2>
          <p>${place.description}</p>
        </div>
        <div class="place-info">
          <p>Price: $${place.price} per night</p>
          <p>Host ID: ${place.owner_id}</p>
          <p>Amenities: ${place.amenities ? place.amenities.map(a => a.name).join(', ') : 'None'}</p>
        </div>
        `;
}

function displayReviews(reviews) {
  const reviewsList = document.getElementById('reviews');
  reviewsList.innerHTML = '';
  reviews.forEach(review => {
    const reviewItem = document.createElement('div');
    reviewItem.className = 'review-card';
    reviewItem.innerHTML = `
      <p>${review.text}</p>
      <p>Rating: ${review.rating}/5</p>
      <p>By: ${review.user_id}</p>
    `;
    reviewsList.appendChild(reviewItem);
  });
}

function checkAuthentificationAddReview() {
  const token = getCookie('token');
  if (!token) {
    window.location.href = 'index.html';
  }
  return token;
}

async function submitReview(token, placeId, reviewText, rating) {
  const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: reviewText,
      rating: parseInt(rating),
      place_id: placeId
    })
  });
  handleResponse(response);
}

function handleResponse(response) {
  if (response.ok) {
    alert('Review submitted successfully!');
    document.getElementById('review-form').reset();
  } else {
    alert('Failed to submit review');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('login.html')) {
    document.getElementById('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html';
      } else {
        alert('Login failed: ' + response.statusText);
      }
    });
  }
  if (window.location.pathname.includes('index.html')) {
    const priceFilter = document.getElementById('price-filter');
    priceFilter.innerHTML = `
      <option value="all">All</option>
      <option value="10">10</option>
      <option value="50">50</option>
      <option value="100">100</option>
    `;
    checkauthentification();
    priceFilter.addEventListener('change', (event) => {
      const selectedPrice = event.target.value;
      const placeCards = document.querySelectorAll('.place-card');
      placeCards.forEach(card => {
        const price = parseFloat(card.dataset.price);
        if (selectedPrice === 'all' || price <= parseInt(selectedPrice)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
if (window.location.pathname.includes('place.html')) {
  checkAuthentificationPlace();
}
if (window.location.pathname.includes('add_review.html')) {
  const token = checkAuthentificationAddReview();
  const placeId = getPlaceIdFromURL();
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const reviewText = document.getElementById('review').value;
      const rating = document.getElementById('rating').value;
      await submitReview(token, placeId, reviewText, rating);
    });
  }
}
});