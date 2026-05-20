const request = require('supertest');
const app = require('../app');

describe('Auth Middleware Integration Tests', () => {
    it('should refuse access to /api/patients when no token is provided', async () => {
        const res = await request(app)
            .get('/api/patients');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.code).toEqual('AUTH_MISSING_TOKEN');
    });

    it('should refuse access to /api/patients when an invalid token is provided', async () => {
        const res = await request(app)
            .get('/api/patients')
            .set('Authorization', 'Bearer invalidtoken123');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
        expect(res.body.code).toEqual('AUTH_INVALID_TOKEN');
    });
});
