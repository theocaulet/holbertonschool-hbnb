from app import db
from .base_model import BaseModel
from .amenity import place_amenity


class Place(BaseModel):
    """Place model mapped to the 'places' table."""
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    # Foreign Key: Place → User (owner)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'),
                         nullable=False)

    # One-to-Many: Place → Reviews
    reviews = db.relationship('Review', backref='place', lazy=True,
                               cascade='all, delete-orphan')

    # Many-to-Many: Place ↔ Amenity
    amenities = db.relationship('Amenity', secondary=place_amenity,
                                 lazy='subquery',
                                 backref=db.backref('places', lazy=True))

    def to_dict(self):
        """Convert place to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'owner_id': self.owner_id,
            'amenities': [amenity.id for amenity in self.amenities]
        })
        return base_dict

    def __str__(self):
        return f"Place({self.title} - ${self.price}/night)"
