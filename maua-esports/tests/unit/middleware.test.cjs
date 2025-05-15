const request = require('supertest');
const { app } = require('../../backend.cjs');

describe('Middleware CORS', () => {
  it('deve configurar CORS corretamente', async () => {
    const response = await request(app)
      .options('/usuarios')
      .expect(204);
    
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
  });
});