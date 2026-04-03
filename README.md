# HBnB - Part 4: Web Front-End Interface

## Description

Part 4 of the HBnB project focuses on building a web front-end interface that communicates with the backend through a REST API. The interface allows users to browse places, log in, and submit reviews.

---

## Project Structure

```
holbertonschool-hbnb/
├── README.md
├── Swagger Documentation.txt
├── part1/
├── part2/
├── part3/
└── part4/
	├── index.html          # Main page - List of places
	├── login.html          # Login page
	├── place.html          # Place details page
	├── add_review.html     # Add a review page
	├── styles.css          # CSS styles
	├── scripts.js          # JavaScript
	├── images/             # Front-end static images
	└── backend/            # Flask REST API for Part 4
		├── run.py
		├── requirements.txt
		└── app/
```

---

## HTML Pages

### 1. `index.html` - List of Places
- Displays all places as cards using the `.place-card` class
- Each card contains the place name, price, and a "View Details" button
- Price filter (All, 10, 50, 100)
- Login/Logout link in the header

### 2. `login.html` - Login Form
- Form with email and password fields
- Redirects to `index.html` after successful login
- Error message if credentials are incorrect

### 3. `place.html` - Place Details
- Displays detailed information about a place (title, description, price, host, amenities)
- Lists existing reviews
- Review form visible only if the user is authenticated

### 4. `add_review.html` - Review Form
- Accessible only to authenticated users
- Displays the name of the place being reviewed
- Form with a text field and rating (0-5)

---

## CSS

### Main Classes

| Class | Description |
|-------|-------------|
| `.logo` | Site logo (width: 150px) |
| `.login-button` | Login button in the header |
| `.place-card` | Place card (margin: 20px, padding: 20px, border-radius: 10px) |
| `.details-button` | "View Details" button on each card |
| `.place-details` | Main section of place details |
| `.place-info` | Secondary information section of the place |
| `.review-card` | Review card (margin: 20px, padding: 20px, border-radius: 10px) |

### Required Fixed Parameters
- **Margin**: 20px for cards
- **Padding**: 20px for cards
- **Border**: 1px solid #ddd for cards
- **Border radius**: 10px for cards

---

## JavaScript - `scripts.js`

### Main Functions

#### Authentication
```javascript
// Get a cookie value by its name
function getCookie(name)

// Check authentication on index.html
function checkAuthentication()

// Check authentication on place.html
function checkAuthenticationPlace()

// Check authentication on add_review.html
function checkAuthenticationAddReview()
```

#### Places
```javascript
// Fetch the list of places from the API
async function fetchPlaces(token)

// Display places as cards
function displayPlaces(places)

// Fetch details of a place
async function fetchPlacesDetails(token, placeId)

// Display place details
function displayPlaceDetails(place)
```

#### Reviews
```javascript
// Display reviews for a place
function displayReviews(reviews)

// Submit a review
async function submitReview(token, placeId, reviewText, rating)

// Handle the API response
function handleResponse(response)
```

#### Utilities
```javascript
// Extract place ID from the URL
function getPlaceIdFromURL()
```

---

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| GET | `/api/v1/places/` | List of places |
| GET | `/api/v1/places/<id>` | Place details |
| GET | `/api/v1/reviews/places/<id>` | Reviews for a place |
| POST | `/api/v1/reviews/` | Submit a review |

---

## Installation and Setup

### Prerequisites
- HBnB backend running on `http://127.0.0.1:5000`
- Python 3 installed

### Steps

**1. Start the backend**
```bash
cd part4/backend
python3 run.py
```

**2. Start the frontend server**
```bash
cd part4
python3 -m http.server 8000
```

**3. Open in the browser**
```
http://127.0.0.1:8000/index.html
```

---

## Step-by-Step Testing

### Step 1 - Verify the backend is running
Open in the browser:
```
http://127.0.0.1:5000/api/v1/places/
```
You should see a list of places in JSON format.

### Step 2 - Test `index.html`
1. Open `http://127.0.0.1:8000/index.html`
2. Verify that the **Login** link appears in the header
3. Verify that the list of places **does not display** because you are not logged in

### Step 3 - Test `login.html`
1. Click on **Login**
2. Enter **invalid** credentials → you should see an alert `"Login failed"`
3. Enter **valid** credentials → you should be redirected to `index.html`
4. Verify that the **Login** link is now **hidden**
5. Verify that the list of places **displays**

### Step 4 - Test the price filter
1. On `index.html`, select **10** in the filter → only places under $10 are displayed
2. Select **50** → only places under $50 are displayed
3. Select **100** → only places under $100 are displayed
4. Select **All** → all places reappear
5. Filtering works **without page reload**

### Step 5 - Test `place.html`
1. Click on **"View Details"** for a place
2. Verify the URL contains the place ID: `place.html?id=...`
3. Verify that the **details** display (title, description, price, host, amenities)
4. Verify that **reviews** display if any exist
5. Verify that the review form **appears** because you are logged in

### Step 6 - Test submitting a review
1. On `place.html`, fill in the review form
2. Click **Submit**
3. You should see the message `"Review submitted successfully!"`
4. Verify that the form **clears** automatically

### Step 7 - Test `add_review.html`
1. Open `http://127.0.0.1:8000/add_review.html` without being logged in
2. You should be **redirected** to `index.html`
3. Log in and try again from a place details page
4. The place name should display at the top of the page

### Step 8 - Test logout / token expiration
1. The JWT token **expires** after a certain time
2. If you receive a **401 Unauthorized** error, log in again
3. After logging in again, all features should work correctly

---

## Known Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Places don't display | User not logged in | Log in first |
| 401 Unauthorized error | JWT token expired | Log in again |
| `place.html` doesn't load details | URL without `?id=...` | Access via "View Details" button |
| Price filter doesn't work | URL without `index.html` | Use `http://127.0.0.1:8000/index.html` |
| CORS error | URL without trailing `/` | Add `/` at the end of API endpoints |

---

## Author
Project completed as part of the Holberton School curriculum.