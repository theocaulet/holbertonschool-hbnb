from app import db
from app.models.base_model import BaseModel
"""Review model for HBNB application."""


class Review(BaseModel):
    """Represents a review in the HBNB application."""
    __tablename__ = 'reviews'

    text = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.String(36), nullable=False)
    place_id = db.Column(db.String(36), nullable=False)

    def __init__(self, text, rating, place_id, user_id):
        """Initialize a Review instance."""
        super().__init__()
        if not isinstance(rating, int):
            raise ValueError("Rating must be an integer")
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        if not isinstance(text, str):
            raise ValueError("Text must be a string")
        self.text = text
        self.rating = rating
        self.place_id = place_id
        self.user_id = user_id

    def to_dict(self):
        """Convert review to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'text': self.text,
            'rating': self.rating,
            'user_id': self.user_id,
            'place_id': self.place_id,
        })
        return base_dict
