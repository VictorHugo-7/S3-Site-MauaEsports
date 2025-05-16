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
      id: 1,
      nome: 'Time de Teste'
    };

    const time = await Time.create(timeData);

    expect(time._id).toBeDefined();
    expect(time.id).toBe(timeData.id);
    expect(time.nome).toBe(timeData.nome);
    expect(time.createdAt).toBeInstanceOf(Date);
  });

  it('deve falhar ao criar time sem ID', async () => {
    const timeData = {
      nome: 'Time sem ID'
    };

    await expect(Time.create(timeData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve falhar ao criar time sem nome', async () => {
    const timeData = {
      id: 2
    };

    await expect(Time.create(timeData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve garantir que o ID é único', async () => {
    const timeData = {
      id: 3,
      nome: 'Time com ID único'
    };

    // Primeira criação deve funcionar
    await Time.create(timeData);

    // Segunda tentativa deve falhar
    await expect(Time.create(timeData))
      .rejects
      .toThrow(/duplicate key error/);
  });

  it('deve garantir que o nome é único', async () => {
    const timeData = {
      id: 4,
      nome: 'Time com nome único'
    };

    const timeData2 = {
      id: 5,
      nome: 'Time com nome único'
    };

    // Primeira criação deve funcionar
    await Time.create(timeData);

    // Segunda tentativa deve falhar
    await expect(Time.create(timeData2))
      .rejects
      .toThrow(/duplicate key error/);
  });
});