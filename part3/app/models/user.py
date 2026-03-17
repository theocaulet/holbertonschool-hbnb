import re
from app import db, bcrypt
from .base_model import BaseModel


class User(BaseModel):
    """User model mapped to the 'users' table."""
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    # One-to-Many: User → Places
    places = db.relationship('Place', backref='owner', lazy=True)

    # One-to-Many: User → Reviews
    reviews = db.relationship('Review', backref='user', lazy=True)

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)

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
