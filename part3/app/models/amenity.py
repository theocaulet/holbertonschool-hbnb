from app.models.base_model import BaseModel
"""Amenity model for HBNB application."""


class Amenity(BaseModel):
    """Represents an amenity in the HBNB application."""
    def __init__(self, name):
        """Initialize an Amenity instance."""
        super().__init__()
        self.name = name

    @property
    def name(self):
        """Get the name of the amenity."""
        return self._name

    @name.setter
    def name(self, value):
        """Set the name of the amenity with validation."""
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
        if len(value) > 50:
            raise ValueError("Name must be a maximum of 50 characters")
        self._name = value

    def to_dict(self):
        """Convert amenity to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'name': self.name
        })
        return base_dict
