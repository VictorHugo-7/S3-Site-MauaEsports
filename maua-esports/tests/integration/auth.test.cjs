const request = require('supertest');
const { app, Usuario } = require('../../backend.cjs');

describe('Autenticação', () => {
  beforeAll(async () => {
    await Usuario.create({
      email: 'auth-test@maua.br',
      tipoUsuario: 'Jogador'
    });
  });

  afterAll(async () => {
    await Usuario.deleteMany({});
  });

  describe('Middleware authenticate', () => {
    it('deve bloquear requisição sem token (trains)', async () => {
      const response = await request(app)
        .get('/trains/all')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('deve permitir requisição com token válido(trains)', async () => {
      // Primeiro verifique manualmente a rota
      const manualCheck = await request(app)
        .get('/trains/all')
        .set('Authorization', 'Bearer frontendmauaesports');

      console.log('Resposta manual:', manualCheck.status, manualCheck.body);

      // Depois faça o teste formal
      const response = await request(app)
        .get('/trains/all')
        .set('Authorization', 'Bearer frontendmauaesports')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('deve bloquear requisição sem token (trains)', async () => {
      const response = await request(app)
        .get('/modality/all')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    it('deve permitir requisição com token válido(trains)', async () => {
      // Primeiro verifique manualmente a rota
      const manualCheck = await request(app)
        .get('/modality/all')
        .set('Authorization', 'Bearer frontendmauaesports');

      console.log('Resposta manual:', manualCheck.status, manualCheck.body);

      // Depois faça o teste formal
      const response = await request(app)
        .get('/modality/all')
        .set('Authorization', 'Bearer frontendmauaesports')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});