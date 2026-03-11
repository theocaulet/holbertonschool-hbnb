from .user import User
from .base_model import BaseModel


class Place(BaseModel):
    """Place model for the HBnB application."""

    def __init__(self, title: str, description: str, price: float,
                 latitude: float, longitude: float, owner: User):
        """Initialize a Place instance."""
        super().__init__()

        # Initialize collections first
        self._reviews = []
        self._amenities = []

        # Set values through properties to trigger validation
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner

    @property
    def title(self):
        """Get the place title."""
        return self._title

    @title.setter
    def title(self, value):
        """Set the place title with validation."""
        if not value or len(value) > 100:
            raise ValueError(
                "Title is required and must be 100 characters or less")
        self._title = value

    @property
    def description(self):
        """Get the place description."""
        return self._description

    @description.setter
    def description(self, value):
        """Set the place description with validation."""
        if value is None:
            self._description = ""
        elif not isinstance(value, str):
            raise ValueError("Description must be a string")
        else:
            self._description = value

    @property
    def price(self):
        """Get the place price."""
        return self._price

    @price.setter
    def price(self, value):
        """Set the place price with validation."""
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError("Price must be a positive number")
        self._price = float(value)

    @property
    def latitude(self):
        """Get the place latitude."""
        return self._latitude

    @latitude.setter
    def latitude(self, value):
        """Set the place latitude with validation."""
        if (not isinstance(value, (int, float)) or
                not (-90.0 <= value <= 90.0)):
            raise ValueError("Latitude must be between -90.0 and 90.0")
        self._latitude = float(value)

    @property
    def longitude(self):
        """Get the place longitude."""
        return self._longitude

    @longitude.setter
    def longitude(self, value):
        """Set the place longitude with validation."""
        if (not isinstance(value, (int, float)) or
                not (-180.0 <= value <= 180.0)):
            raise ValueError("Longitude must be between -180.0 and 180.0")
        self._longitude = float(value)

    @property
    def owner(self):
        """Get the place owner."""
        return self._owner

    @owner.setter
    def owner(self, value):
        """Set the place owner with validation."""
        if not value or not hasattr(value, 'id'):
            raise ValueError("Owner must be a valid user object")
        if not isinstance(value, User):
            raise ValueError("Owner must be a User instance")
        self._owner = value

    @property
    def reviews(self):
        """Get the place reviews."""
        return self._reviews.copy()

    @property
    def amenities(self):
        """Get the place amenities."""
        return self._amenities.copy()

    def add_review(self, review):
        """Add a review to the place."""
        if review not in self._reviews:
            self._reviews.append(review)

    def add_amenity(self, amenity):
        """Add an amenity to the place."""
        if amenity not in self._amenities:
            self._amenities.append(amenity)

    def remove_review(self, review):
        """Remove a review from the place."""
        if review in self._reviews:
            self._reviews.remove(review)

    def remove_amenity(self, amenity):
        """Remove an amenity from the place."""
        if amenity in self._amenities:
            self._amenities.remove(amenity)

    def to_dict(self):
        """Convert place to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'owner_id': self.owner.id if self.owner else None,
            'amenities': [
                amenity.id if hasattr(amenity, 'id') else amenity
                for amenity in self._amenities
            ]
        })
        return base_dict

    def __str__(self):
        """String representation of place."""
        return f"Place({self.title} - ${self.price}/night)"
