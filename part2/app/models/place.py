from .base_model import BaseModel


class Place(BaseModel):
    def __init__(self, title, description, price, latitude, longitude, owner):
        super().__init__()

        if not title or len(title) > 100:
            raise ValueError("Title is required and must be 100 characters or less")
        if not isinstance(price, (int, float)) or price <= 0:
            raise ValueError("Price must be a positive number")
        if not isinstance(latitude, (int, float)) or not (-90.0 <= latitude <= 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0")
        if not isinstance(longitude, (int, float)) or not (-180.0 <= longitude <= 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0")
        if not owner or not hasattr(owner, 'id'):
            raise ValueError("Owner must be a valid user object")

        self.title = title
        self.description = description or ""
        self.price = float(price)
        self.latitude = float(latitude)
        self.longitude = float(longitude)
        self.owner = owner
        self.reviews = []
        self.amenities = []

    def add_review(self, review):
        if review not in self.reviews:
            self.reviews.append(review)

    def add_amenity(self, amenity):
        if amenity not in self.amenities:
            self.amenities.append(amenity)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'owner_id': self.owner.id
            if hasattr(self.owner, 'id') else self.owner,
            'amenities': [amenity.id for amenity in self.amenities]
            }

    def __str__(self):
        return self.id + ":" + self.title + " - $" + str(self.price) + "/night"
