from .base_model import BaseModel


class Place(BaseModel):
<<<<<<< HEAD
    """Place model for the HBnB application."""
    
    def __init__(self, title, description, price, latitude, longitude, owner):
        """Initialize a Place instance."""
        super().__init__()
        
        # Validate inputs
=======
    def __init__(self, title, description, price, latitude, longitude, owner):
        super().__init__()

>>>>>>> 78c73777ffd792a58baa0b5b06064223d5d18f2a
        if not title or len(title) > 100:
            raise ValueError("Title is required and must be 100 characters or less")
        if not isinstance(price, (int, float)) or price <= 0:
            raise ValueError("Price must be a positive number")
        if not isinstance(latitude, (int, float)) or not (-90.0 <= latitude <= 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0")
        if not isinstance(longitude, (int, float)) or not (-180.0 <= longitude <= 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0")
<<<<<<< HEAD
        if not owner:
            raise ValueError("Owner is required")
            
=======
        if not owner or not hasattr(owner, 'id'):
            raise ValueError("Owner must be a valid user object")

>>>>>>> 78c73777ffd792a58baa0b5b06064223d5d18f2a
        self.title = title
        self.description = description or ""
        self.price = float(price)
        self.latitude = float(latitude)
        self.longitude = float(longitude)
        self.owner = owner
        self.reviews = []
        self.amenities = []

    def add_review(self, review):
<<<<<<< HEAD
        """Add a review to the place."""
=======
>>>>>>> 78c73777ffd792a58baa0b5b06064223d5d18f2a
        if review not in self.reviews:
            self.reviews.append(review)

    def add_amenity(self, amenity):
<<<<<<< HEAD
        """Add an amenity to the place."""
=======
>>>>>>> 78c73777ffd792a58baa0b5b06064223d5d18f2a
        if amenity not in self.amenities:
            self.amenities.append(amenity)

    def to_dict(self):
<<<<<<< HEAD
        """Convert place to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
=======
        return {
            'id': self.id,
>>>>>>> 78c73777ffd792a58baa0b5b06064223d5d18f2a
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
<<<<<<< HEAD
            'owner_id': self.owner.id if self.owner else None
        })
        return base_dict

    def __str__(self):
        """String representation of place."""
        return f"Place({self.title} - ${self.price}/night)"
=======
            'owner_id': self.owner.id
            if hasattr(self.owner, 'id') else self.owner,
            'amenities': [amenity.id for amenity in self.amenities]
            }

    def __str__(self):
        return self.id + ":" + self.title + " - $" + str(self.price) + "/night"
>>>>>>> 78c73777ffd792a58baa0b5b06064223d5d18f2a
