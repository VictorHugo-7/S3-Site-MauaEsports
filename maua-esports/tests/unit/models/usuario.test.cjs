const mongoose = require('mongoose');
const { Usuario } = require('../../../backend.cjs');

describe('Modelo Usuario', () => {
  // Função para gerar emails válidos no formato Mauá
  function generateMauaEmail() {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const randomDigit = Math.floor(1 + Math.random() * 9);
    return `24.${randomDigits}-${randomDigit}@maua.br`;
  }

  beforeAll(async () => {
    // Conexão com o banco de dados já deve estar configurada no setup.js
  });

  afterEach(async () => {
    await Usuario.deleteMany({});
  });

  it('deve criar um usuário válido com email @maua.br', async () => {
    const userData = {
      email: generateMauaEmail(),
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

  it('deve falhar ao criar usuário com formato Mauá inválido', async () => {
    const userData = {
      email: '24.123-1@maua.br', // Formato inválido
      tipoUsuario: 'Jogador'
    };

    await expect(Usuario.create(userData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve validar Discord ID com 18 dígitos', async () => {
    const userData = {
      email: generateMauaEmail(),
      tipoUsuario: 'Jogador',
      discordID: '123456789012345678' // 18 dígitos
    };

    const usuario = await Usuario.create(userData);
    expect(usuario.discordID).toBe(userData.discordID);
  });

  it('deve falhar com Discord ID inválido', async () => {
    const userData = {
      email: generateMauaEmail(),
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
        email: generateMauaEmail(),
        tipoUsuario: tipo
      };

      const usuario = await Usuario.create(userData);
      expect(usuario.tipoUsuario).toBe(tipo);
    }
  });

  it('deve falhar com tipo de usuário inválido', async () => {
    const userData = {
      email: generateMauaEmail(),
      tipoUsuario: 'Tipo Inválido Que Não Existe'
    };

    await expect(Usuario.create(userData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve garantir que o email é único', async () => {
    const emailUnico = generateMauaEmail();
    const userData = {
      email: emailUnico,
      tipoUsuario: 'Jogador'
    };

    // Primeira criação deve funcionar
    await Usuario.create(userData);

    // Segunda tentativa deve falhar
    await expect(Usuario.create(userData))
      .rejects
      .toThrow(/já está em uso/);
  });
});