import uuid
from datetime import datetime
from app import db


class BaseModel(db.Model):
    """Base model with common fields for all entities."""
    __abstract__ = True

    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now,
                           onupdate=datetime.now)

    def save(self):
        """Update the updated_at timestamp and save to database."""
        self.updated_at = datetime.now()
        db.session.commit()

    def update(self, data):
        """Update the attributes of the object
        based on the provided dictionary"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.save()

    def to_dict(self):
        """Convert instance to dictionary representation"""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
