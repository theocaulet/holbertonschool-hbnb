from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt
from app.services import facade

api = Namespace('amenities', description='Amenity operations')

amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})


@api.route('/')
class AmenityList(Resource):
    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Retrieve list of all amenities (PUBLIC)"""
        amenities = facade.get_all_amenities()
        return [{'id': a.id, 'name': a.name} for a in amenities], 200

    @api.expect(amenity_model, validate=True)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Create a new amenity (PUBLIC)"""
        amenity_data = api.payload
        try:
            new_amenity = facade.create_amenity(amenity_data)
            return {'id': new_amenity.id, 'name': new_amenity.name}, 201
        except ValueError as e:
            return {'error': str(e)}, 400


@api.route('/<amenity_id>')
class AmenityResource(Resource):
    @api.response(200, 'Amenity details retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        """Get amenity details by ID (PUBLIC)"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404
        return {'id': amenity.id, 'name': amenity.name}, 200

    @jwt_required()
    @api.expect(amenity_model, validate=True)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(403, 'Admin privileges required')
    @api.response(400, 'Invalid input data')
    def put(self, amenity_id):
        """Update an amenity (ADMIN only)"""
        claims = get_jwt()
        if not claims.get('is_admin', False):
            return {'error': 'Admin privileges required'}, 403

        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404

        amenity_data = api.payload
        try:
            updated_amenity = facade.update_amenity(amenity_id, amenity_data)
            return {'id': updated_amenity.id, 'name': updated_amenity.name}, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Amenity deleted successfully')
    @api.response(404, 'Amenity not found')
    def delete(self, amenity_id):
        """Delete an amenity"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404
        facade.delete_amenity(amenity_id)
        return {'message': 'Amenity deleted successfully'}, 200
