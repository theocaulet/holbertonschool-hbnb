from app import db
from app.models.base_model import BaseModel
"""Amenity model for HBNB application."""


class Amenity(BaseModel):
    """Represents an amenity in the HBNB application."""
    __tablename__ = 'amenities'

    name = db.Column(db.String(50), nullable=False)

    def __init__(self, name):
        """Initialize an Amenity instance."""
        super().__init__()
        if not isinstance(name, str):
            raise ValueError("Name must be a string")
        if len(name) > 50:
            raise ValueError("Name must be a maximum of 50 characters")
        self.name = name

    def to_dict(self):
        """Convert amenity to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'name': self.name
        })
        return base_dict
