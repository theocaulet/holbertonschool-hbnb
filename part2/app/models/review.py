from app.models.base_model import BaseModel
"""Review model for HBNB application."""


class Review(BaseModel):
    """Represents a review in the HBNB application."""
    def __init__(self, text, rating, place, user):
        """Initialize a Review instance."""
        super().__init__()
        self.text = text
        self.rating = rating
        self.place_id = place.id
        self.user_id = user.id

    @property
    def rating(self):
        """Get the rating of the review."""
        return self._rating

    @rating.setter
    def rating(self, value):
        """Set the rating of the review with validation."""
        if not isinstance(value, int):
            raise ValueError("Rating must be an integer")
        if value < 1 or value > 5:
            raise ValueError("Rating must be between 1 and 5")
        self._rating = value

    @property
    def text(self):
        """Get the text of the review."""
        return self._text

    @text.setter
    def text(self, value):
        """Set the text of the review with validation."""
        if not isinstance(value, str):
            raise ValueError("Text must be a string")
        self._text = value

    @property
    def place_id(self):
        """Get the place_id of the review."""
        return self._place_id

    @place_id.setter
    def place_id(self, value):
        """Set the place_id of the review with validation."""
        if not isinstance(value, str):
            raise ValueError("Place must be a string")
        self._place_id = value

    @property
    def user_id(self):
        """Get the user_id of the review."""
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        """Set the user_id of the review with validation."""
        if not isinstance(value, str):
            raise ValueError("User must be a string")
        self._user_id = value
