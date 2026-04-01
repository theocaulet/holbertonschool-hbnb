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
            <h2>${place.name}</h2>
            <p>${place.description}</p>
            <p>Price: $${place.price_by_night} per night</p>
            <a href="place.html?id=${place.id}" class="details-button">View Details</a>
          `;
          placesList.appendChild(card);
        })
      })
  }
});
