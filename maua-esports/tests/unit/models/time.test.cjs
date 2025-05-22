const mongoose = require('mongoose');
const { Time } = require('../../../backend.cjs');

describe('Modelo Time', () => {
  beforeAll(async () => {
    // Conexão com o banco de dados já deve estar configurada no setup.js
  });

  afterEach(async () => {
    await Time.deleteMany({});
  });

  it('deve criar um time válido com campos obrigatórios', async () => {
    const timeData = {
      nome: 'Time de Teste'
    };

    const time = await Time.create(timeData);

    expect(time._id).toBeDefined();
    expect(time.nome).toBe(timeData.nome);
    expect(time.createdAt).toBeInstanceOf(Date);
  });

  it('deve falhar ao criar time sem nome', async () => {
    const timeData = {};

    await expect(Time.create(timeData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve garantir que o nome é único', async () => {
    const timeData = {
      nome: 'Time com nome único'
    };

    // Primeira criação deve funcionar
    await Time.create(timeData);

    // Segunda tentativa deve falhar
    await expect(Time.create(timeData))
      .rejects
      .toThrow(/duplicate key error/);
  });
});