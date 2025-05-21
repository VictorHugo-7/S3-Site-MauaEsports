const request = require('supertest');
const { app, mongoose, Usuario } = require('../../backend.cjs'); 
const axios = require('axios');

describe('Rotas de Discord (/auth/discord/callback)', () => {


  afterEach(async () => {
    await Usuario.deleteMany({});
  });

  describe('GET /auth/discord/callback', () => {
    it('deve falhar se o código não for fornecido', async () => {
      const response = await request(app)
        .get('/auth/discord/callback')
        .query({ state: JSON.stringify({ userId: '123', returnUrl: '/' }) })
        .expect(400);

      expect(response.text).toBe('Código de autorização não fornecido');
    });

    it('deve falhar se o state não for fornecido', async () => {
      const response = await request(app)
        .get('/auth/discord/callback')
        .query({ code: 'fakeCode' })
        .expect(400);

      expect(response.text).toBe('State não fornecido');
    });

    it('deve falhar se o userId não for fornecido no state', async () => {
      const response = await request(app)
        .get('/auth/discord/callback')
        .query({ code: 'fakeCode', state: JSON.stringify({ returnUrl: '/' }) })
        .expect(400);

      expect(response.text).toBe('UserId não fornecido');
    });

  });
});