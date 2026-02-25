import re
from .base_model import BaseModel

class User(BaseModel):
    def __init__(self, first_name, last_name, email, is_admin=False):
        super().__init__()
        
        if not first_name or len(first_name) > 50:
            raise ValueError("First name is required and must be 50 characters or less")
        if not last_name or len(last_name) > 50:
            raise ValueError("Last name is required and must be 50 characters or less")
        if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            raise ValueError("Valid email is required")
        if not isinstance(is_admin, bool):
            raise ValueError("is_admin must be a boolean")
            
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin

    def __str__(self):
        return f"User({self.id}): {self.first_name} {self.last_name}"
  