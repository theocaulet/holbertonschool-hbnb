from app import db
from app.models.base_model import BaseModel

"""Review model for HBNB application."""


class Review(BaseModel):
    """Represents a review in the HBNB application."""
    __tablename__ = 'reviews'

    text = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    # Foreign Key: Review → Place
    place_id = db.Column(db.String(36), db.ForeignKey('places.id'),
                         nullable=False)

    # Foreign Key: Review → User
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'),
                        nullable=False)

    def to_dict(self):
        """Convert review to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'text': self.text,
            'rating': self.rating,
            'place_id': self.place_id,
            'user_id': self.user_id
        })
        return base_dict
