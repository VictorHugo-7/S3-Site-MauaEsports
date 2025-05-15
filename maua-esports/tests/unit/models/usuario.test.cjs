const mongoose = require('mongoose');
const { Usuario } = require('../../../backend.cjs');

describe('Modelo Usuario', () => {
  beforeAll(async () => {
    // Conexão com o banco de dados já deve estar configurada no setup.js
  });

  afterEach(async () => {
    await Usuario.deleteMany({});
  });

  it('deve criar um usuário válido com email @maua.br', async () => {
    const userData = {
      email: 'teste.valido@maua.br',
      tipoUsuario: 'Jogador'
    };

    const usuario = await Usuario.create(userData);

    expect(usuario._id).toBeDefined();
    expect(usuario.email).toBe(userData.email);
    expect(usuario.tipoUsuario).toBe(userData.tipoUsuario);
    expect(usuario.createdAt).toBeInstanceOf(Date);
  });

  it('deve falhar ao criar usuário com email inválido', async () => {
    const userData = {
      email: 'email-invalido-sem-arroba',
      tipoUsuario: 'Jogador'
    };

    await expect(Usuario.create(userData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve falhar ao criar usuário com email não @maua.br', async () => {
    const userData = {
      email: 'teste@gmail.com',
      tipoUsuario: 'Jogador'
    };

    await expect(Usuario.create(userData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve validar Discord ID com 18 dígitos', async () => {
    const userData = {
      email: 'teste.discord@maua.br',
      tipoUsuario: 'Jogador',
      discordID: '123456789012345678' // 18 dígitos
    };

    const usuario = await Usuario.create(userData);
    expect(usuario.discordID).toBe(userData.discordID);
  });

  it('deve falhar com Discord ID inválido', async () => {
    const userData = {
      email: 'teste.discord.invalido@maua.br',
      tipoUsuario: 'Jogador',
      discordID: '123' // Inválido (menos de 18 dígitos)
    };

    await expect(Usuario.create(userData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve aceitar tipos de usuário válidos', async () => {
    const tiposValidos = [
      'Administrador Geral',
      'Administrador',
      'Capitão de time',
      'Jogador'
    ];

    for (const tipo of tiposValidos) {
      const userData = {
        email: `teste.${tipo.replace(/\s+/g, '-').toLowerCase()}@maua.br`,
        tipoUsuario: tipo
      };

      const usuario = await Usuario.create(userData);
      expect(usuario.tipoUsuario).toBe(tipo);
    }
  });

  it('deve falhar com tipo de usuário inválido', async () => {
    const userData = {
      email: 'teste.tipo.invalido@maua.br',
      tipoUsuario: 'Tipo Inválido Que Não Existe'
    };

    await expect(Usuario.create(userData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve garantir que o email é único', async () => {
    const userData = {
      email: 'email.unico@maua.br',
      tipoUsuario: 'Jogador'
    };

    // Primeira criação deve funcionar
    await Usuario.create(userData);

    // Segunda tentativa deve falhar
    await expect(Usuario.create(userData))
      .rejects
      .toThrow(/já está em uso/); // Atualize para a mensagem real
  });
});