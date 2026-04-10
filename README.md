# HBnB Project

## Overview

HBnB is an Airbnb-like application built in four parts. Each part adds a new layer to the project: architecture, REST API, persistence and authentication, then a web front-end that consumes the API.

## Project Structure

```
holbertonschool-hbnb/
├── README.md
├── Swagger Documentation.txt
├── part1/
├── part2/
├── part3/
└── part4/
```

## Parts

### Part 1 - UML and Architecture Design

This part contains the design documents for the HBnB application. It focuses on the overall architecture before implementation.

Included deliverables:
- Class diagram
- Package diagram
- Sequence diagram
- UML documentation

Main purpose:
- Define the entities, relationships, and interactions in the system
- Prepare the project structure for the API and persistence layers

### Part 2 - REST API with In-Memory Storage

This part introduces the first working backend using Flask and Flask-RESTX with an in-memory repository.

Main features:
- REST endpoints for users, places, reviews, and amenities
- Service layer with a Facade pattern
- Input validation and CRUD operations
- Swagger documentation generated from the API

Core structure:
- `app/api/v1/`: API routes
- `app/models/`: domain models
- `app/persistence/`: repository implementation
- `app/services/`: facade and business logic

### Part 3 - Authentication and Database Persistence

This part upgrades the backend with JWT authentication, role-based access control, and SQLAlchemy persistence.

Main features:
- JWT login endpoint
- Admin role handling
- SQLAlchemy models and SQLite database
- Schema and seed scripts
- Improved security for protected routes

Core structure:
- `app/api/v1/auth.py`: authentication routes
- `app/models/`: SQLAlchemy models
- `app/persistence/`: SQLAlchemy repository
- `scripts/`: schema, seed data, and ER diagram

### Part 4 - Web Front-End Interface

This part adds the browser-based user interface that communicates with the backend through the REST API.

Main features:
- Browse places as cards
- Log in and maintain authentication with cookies / token handling
- View place details and reviews
- Submit reviews from the front-end
- Filter places by price without reloading the page

Front-end files:
- `index.html`
- `login.html`
- `place.html`
- `add_review.html`
- `styles.css`
- `scripts.js`

Backend for Part 4:
- Located in `part4/backend/`
- Reuses the authenticated API from Part 3

## Part 4 Structure

```
part4/
├── add_review.html
├── backend/
│   ├── app/
│   ├── config.py
│   ├── instance/
│   ├── requirements.txt
│   ├── run.py
│   └── scripts/
├── images/
├── index.html
├── login.html
├── place.html
├── scripts.js
└── styles.css
```

## Running the Project

### Part 3 / Part 4 backend

```bash
cd part4/backend
python3 run.py
```

### Part 4 front-end server

```bash
cd part4
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

## Notes

- Part 1 is documentation-only.
- Part 2 provides the initial API and in-memory persistence.
- Part 3 introduces authentication and database-backed persistence.
- Part 4 adds the web interface on top of the backend.

## Author
Project completed as part of the Holberton School curriculum.