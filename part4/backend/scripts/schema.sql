-- =============================================================================
-- HBnB - Database Schema (Part 3)
-- Creates all tables for the HBnB application
-- Compatible with SQLite
-- =============================================================================

-- Drop tables in reverse dependency order to avoid FK constraint errors
DROP TABLE IF EXISTS place_amenity;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS users;

-- =============================================================================
-- Table: users
-- =============================================================================
CREATE TABLE users (
    id          VARCHAR(36)     PRIMARY KEY,
    first_name  VARCHAR(50)     NOT NULL,
    last_name   VARCHAR(50)     NOT NULL,
    email       VARCHAR(120)    NOT NULL UNIQUE,
    password    VARCHAR(128)    NOT NULL,
    is_admin    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Table: amenities
-- =============================================================================
CREATE TABLE amenities (
    id          VARCHAR(36)     PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Table: places
-- =============================================================================
CREATE TABLE places (
    id          VARCHAR(36)     PRIMARY KEY,
    title       VARCHAR(100)    NOT NULL,
    description VARCHAR(500),
    price       FLOAT           NOT NULL,
    latitude    FLOAT           NOT NULL,
    longitude   FLOAT           NOT NULL,
    owner_id    VARCHAR(36)     NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- =============================================================================
-- Table: reviews
-- =============================================================================
CREATE TABLE reviews (
    id          VARCHAR(36)     PRIMARY KEY,
    text        VARCHAR(500)    NOT NULL,
    rating      INTEGER         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    place_id    VARCHAR(36)     NOT NULL,
    user_id     VARCHAR(36)     NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (place_id) REFERENCES places(id),
    FOREIGN KEY (user_id)  REFERENCES users(id),
    UNIQUE (user_id, place_id)     -- One review per user per place
);

-- =============================================================================
-- Table: place_amenity  (Many-to-Many: Place ↔ Amenity)
-- =============================================================================
CREATE TABLE place_amenity (
    place_id    VARCHAR(36)     NOT NULL,
    amenity_id  VARCHAR(36)     NOT NULL,
    PRIMARY KEY (place_id, amenity_id),
    FOREIGN KEY (place_id)   REFERENCES places(id),
    FOREIGN KEY (amenity_id) REFERENCES amenities(id)
);
