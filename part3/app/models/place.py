from .base_model import BaseModel
from app import db


class Place(BaseModel):
    """Place model for the HBnB application."""
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    def __init__(self, title: str, description: str, price: float,
                 latitude: float, longitude: float, owner_id: str):
        """Initialize a Place instance."""
        super().__init__()

        if not title or len(title) > 100:
            raise ValueError("Title is required "
                             "and must be 100 characters or less")
        if not isinstance(price, (int, float)) or price <= 0:
            raise ValueError("Price must be a positive number")
        if (not isinstance(latitude, (int, float)) or
                not (-90.0 <= latitude <= 90.0)):
            raise ValueError("Latitude must be between -90.0 and 90.0")
        if (not isinstance(longitude, (int, float)) or
                not (-180.0 <= longitude <= 180.0)):
            raise ValueError("Longitude must be between -180.0 and 180.0")

        # Set values through properties to trigger validation
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner_id = owner_id

    def to_dict(self):
        """Convert place to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'owner_id': self.owner_id if self.owner_id else None,
        })
        return base_dict

    def __str__(self):
        """String representation of place."""
        return f"Place({self.title} - ${self.price}/night)"
