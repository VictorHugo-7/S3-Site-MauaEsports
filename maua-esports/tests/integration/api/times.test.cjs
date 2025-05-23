const request = require('supertest');
const { app, Time } = require('../../../backend.cjs');
const path = require('path');

describe('Rotas de Times', () => {
  let testTime;

  beforeAll(async () => {
    testTime = await Time.create({
      nome: 'Time Teste'
    });
  });

  afterAll(async () => {
    await Time.deleteMany({});
  });

  it('GET /times deve retornar times', async () => {
    const res = await request(app)
      .get('/times')
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /times deve criar novo time', async () => {
    const res = await request(app)
      .post('/times')
      .field('nome', 'Novo Time')
      .attach('foto', path.join(__dirname, '../../../src/assets/images/cs2.jpg'))
      .attach('jogo', path.join(__dirname, '../../../src/assets/images/cs2.jpg'))
      .expect(201);

    expect(res.body._id).toBeDefined();
    expect(res.body.nome).toBe('Novo Time');
  });

  describe('DELETE /times/:id', () => {
    it('deve remover um times', async () => {
      const tempTime = await Time.create({
        nome: 'Time para Deletar'
      });

      // Verifica se o time existe
      const createdTime = await Time.findById(tempTime._id);
      expect(createdTime).not.toBeNull();

      const res = await request(app)
        .delete(`/times/${tempTime._id}`)
        .expect(200);

      expect(res.body.message).toBe('Time removido com sucesso');

      // Verifica se foi removido
      const deletedTime = await Time.findById(tempTime._id);
      expect(deletedTime).toBeNull();
    });
  });
});