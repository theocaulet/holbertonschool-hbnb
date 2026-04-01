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

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('login.html')) {
    document.getElementById('login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
        .then(response => response.json())
        .then(data => {
          document.cookie = `token=${data.access_token}`;
          window.location.href = 'index.html';
        })
    });
  }
  if (window.location.pathname.includes('index.html')) {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    if (token) {
      loginLink.textContent = 'Logout';
      loginLink.href = '#'; 
    } else {
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
    }
    fetch('http://127.0.0.1:5000/api/v1/places/')
      .then(response => response.json())
      .then(data => {
        const placesList = document.getElementById('places-list');
        data.forEach(place => {
          const card = document.createElement('div');
          card.className = 'place-card';
          card.innerHTML = `
            <h2>${place.title}</h2>
            <p>${place.description}</p>
            <p>Price: $${place.price} per night</p>
            <a href="place.html?id=${place.id}" class="details-button">View Details</a>
          `;
          placesList.appendChild(card);
        })
      })
  }
  if (window.location.pathname.includes('place.html')) {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('id');
    fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`)
      .then(response => response.json())
      .then(data => {
        const placeDetails = document.getElementById('place-details');
        placeDetails.innerHTML = `
          <h2>${data.title}</h2>
          <p>${data.description}</p>
          <p>Price: $${data.price} per night</p>
          <p>Host: ${data.owner.first_name} ${data.owner.last_name}</p>
          <p>Amenities: ${data.amenities.map(a => a.name).join(', ')}</p>
        `;
        const token = getCookie('token');
        if (token) {
          document.getElementById('add-review').style.display = 'block';
        }
    })
    fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}`)
      .then(response => response.json())
      .then(data => {
        const reviewsList = document.getElementById('reviews');
        data.forEach(review => {
          const reviewItem = document.createElement('div');
          reviewItem.className = 'review-card';
          reviewItem.innerHTML = `
            <p>${review.text}</p>
            <p>By: ${review.user.first_name} ${review.user.last_name}</p>
            <p>Rating: ${review.rating}/5</p>
          `;
          reviewsList.appendChild(reviewItem);
        })
      })
  }
  if (window.location.pathname.includes('add_review.html')) {
    const token = getCookie('token');
    if (!token) {
      window.location.href = 'login.html';
    }
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('id');
    fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('place-name').textContent = data.title;
      })
    document.getElementById('review-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const review = document.getElementById('review').value;
      const rating = document.getElementById('rating').value;
      fetch(`http://127.0.0.1:5000/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: review,
          rating: parseInt(rating),
          place_id: placeId
        })
      })
        .then(response => response.json())
        .then(data => {
          window.location.href = `place.html?id=${placeId}`;
        })
    });
  }
});
