from app.models.base_model import BaseModel
from app import db

"""Amenity model for HBNB application."""


# Association table for many-to-many: Place ↔ Amenity
place_amenity = db.Table(
    'place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey(
        'places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey(
        'amenities.id'), primary_key=True)
)


class Amenity(BaseModel):
    """Represents an amenity in the HBNB application."""
    __tablename__ = 'amenities'

    name = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        """Convert amenity to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'name': self.name
        })
        return base_dict
