# HBnB – Entity-Relationship Diagram

## Overview

This ER diagram represents the full database schema for the HBnB project (Part 3).  
It maps every SQLAlchemy model to its SQL table and shows all relationships:
one-to-many (`User → Places`, `User → Reviews`, `Place → Reviews`) and  
many-to-many (`Place ↔ Amenity` via the `PLACE_AMENITY` join table).

---

## Diagram (Mermaid.js)

```mermaid
erDiagram

    USER {
        string  id          PK
        string  first_name
        string  last_name
        string  email       UK
        string  password
        boolean is_admin
        datetime created_at
        datetime updated_at
    }

    PLACE {
        string  id          PK
        string  title
        string  description
        float   price
        float   latitude
        float   longitude
        string  owner_id    FK
        datetime created_at
        datetime updated_at
    }

    REVIEW {
        string  id          PK
        string  text
        int     rating
        string  place_id    FK
        string  user_id     FK
        datetime created_at
        datetime updated_at
    }

    AMENITY {
        string  id          PK
        string  name
        datetime created_at
        datetime updated_at
    }

    PLACE_AMENITY {
        string  place_id    FK
        string  amenity_id  FK
    }

    %% -----------------------------------------------------------------------
    %% Relationships
    %% -----------------------------------------------------------------------

    %% A User owns zero or many Places (one-to-many)
    USER ||--o{ PLACE : "owns"

    %% A User writes zero or many Reviews (one-to-many)
    USER ||--o{ REVIEW : "writes"

    %% A Place receives zero or many Reviews (one-to-many)
    PLACE ||--o{ REVIEW : "receives"

    %% Many-to-many: Place ↔ Amenity via join table PLACE_AMENITY
    PLACE ||--o{ PLACE_AMENITY : "has"
    AMENITY ||--o{ PLACE_AMENITY : "linked to"
```

---

## Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| `USER` → `PLACE` | One-to-Many | A user can own multiple places; each place has exactly one owner (`owner_id FK`) |
| `USER` → `REVIEW` | One-to-Many | A user can write multiple reviews; each review belongs to one user (`user_id FK`) |
| `PLACE` → `REVIEW` | One-to-Many | A place can have multiple reviews; each review targets one place (`place_id FK`) |
| `PLACE` ↔ `AMENITY` | Many-to-Many | A place can offer many amenities; an amenity can be shared across many places — resolved via `PLACE_AMENITY` join table |

### Business Rules encoded in the schema
- `email` is `UNIQUE` on `USER` — no two accounts share the same address
- `REVIEW` has a composite `UNIQUE(user_id, place_id)` — one review per user per place
- A `REVIEW`'s `rating` is constrained `CHECK (rating BETWEEN 1 AND 5)`
- `PLACE_AMENITY` uses a composite primary key `(place_id, amenity_id)` — prevents duplicate links

---

## Extended Diagram — with Reservation (bonus)

The section below shows how a future `RESERVATION` entity would integrate:

```mermaid
erDiagram

    USER {
        string  id          PK
        string  first_name
        string  last_name
        string  email       UK
        string  password
        boolean is_admin
        datetime created_at
        datetime updated_at
    }

    PLACE {
        string  id          PK
        string  title
        string  description
        float   price
        float   latitude
        float   longitude
        string  owner_id    FK
        datetime created_at
        datetime updated_at
    }

    REVIEW {
        string  id          PK
        string  text
        int     rating
        string  place_id    FK
        string  user_id     FK
        datetime created_at
        datetime updated_at
    }

    AMENITY {
        string  id          PK
        string  name
        datetime created_at
        datetime updated_at
    }

    PLACE_AMENITY {
        string  place_id    FK
        string  amenity_id  FK
    }

    RESERVATION {
        string   id          PK
        string   place_id    FK
        string   user_id     FK
        datetime start_date
        datetime end_date
        float    total_price
        string   status
        datetime created_at
        datetime updated_at
    }

    USER ||--o{ PLACE        : "owns"
    USER ||--o{ REVIEW       : "writes"
    USER ||--o{ RESERVATION  : "books"
    PLACE ||--o{ REVIEW      : "receives"
    PLACE ||--o{ PLACE_AMENITY : "has"
    PLACE ||--o{ RESERVATION : "subject of"
    AMENITY ||--o{ PLACE_AMENITY : "linked to"
```

> **Note**: `RESERVATION` links a `USER` (guest) to a `PLACE` with a date range and
> computed `total_price`. `status` can be `pending`, `confirmed`, or `cancelled`.
> This is entirely additive — no existing table needs modification.
