const mongoose = require('mongoose');
const { Tournament } = require('../../../backend.cjs');

describe('Modelo Tournament', () => {
  beforeAll(async () => {
    // Conexão com o banco de dados já deve estar configurada no setup.js
  });

  afterEach(async () => {
    await Tournament.deleteMany({});
  });

  it('deve criar um campeonato válido com campos obrigatórios', async () => {
    const tournamentData = {
      name: 'Campeonato de Teste',
      description: 'Descrição do campeonato',
      status: 'campeonatos'
    };

    const tournament = await Tournament.create(tournamentData);

    expect(tournament._id).toBeDefined();
    expect(tournament.name).toBe(tournamentData.name);
    expect(tournament.description).toBe(tournamentData.description);
    expect(tournament.status).toBe(tournamentData.status);
    expect(tournament.createdAt).toBeInstanceOf(Date);
    expect(tournament.updatedAt).toBeInstanceOf(Date);
  });

  it('deve falhar ao criar campeonato sem nome', async () => {
    const tournamentData = {
      description: 'Descrição sem nome',
      status: 'campeonatos'
    };

    await expect(Tournament.create(tournamentData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve aceitar apenas status válidos', async () => {
    const validStatuses = ['campeonatos', 'inscricoes', 'passados'];
    
    for (const status of validStatuses) {
      const tournamentData = {
        name: `Campeonato ${status}`,
        status: status
      };

      const tournament = await Tournament.create(tournamentData);
      expect(tournament.status).toBe(status);
    }
  });

  it('deve falhar com status inválido', async () => {
    const tournamentData = {
      name: 'Campeonato com status inválido',
      status: 'status_invalido'
    };

    await expect(Tournament.create(tournamentData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  
});