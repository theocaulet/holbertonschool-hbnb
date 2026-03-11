import re
from .base_model import BaseModel
from app import bcrypt


class User(BaseModel):
    def __init__(self, first_name, last_name, email, password, is_admin=False):
        super().__init__()

        if not first_name or len(first_name) > 50:
            raise ValueError(
                "First name is required and must be 50 characters or less")
        if not last_name or len(last_name) > 50:
            raise ValueError(
                "Last name is required and must be 50 characters or less")
        if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError("Valid email is required")
        if not isinstance(is_admin, bool):
            raise ValueError("is_admin must be a boolean")

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.places = []
        self.password = password

    def add_place(self, place):
        if place not in self.places:
            self.places.append(place)

    def to_dict(self):
        """Convert user to dictionary representation."""
        base_dict = super().to_dict()
        base_dict.update({
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'is_admin': self.is_admin
        })
        return base_dict

    def __str__(self):
        return f"User({self.id}): {self.first_name} {self.last_name}"

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)
