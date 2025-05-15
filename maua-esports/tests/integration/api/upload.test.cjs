const request = require('supertest');
const { app, Usuario } = require('../../../backend.cjs');
const fs = require('fs');
const path = require('path');

describe('Upload de Imagens', () => {
  const testImagePath = path.join(__dirname, '../../../src/assets/images/cs2.jpg');
  const testImagePath2 = path.join(__dirname, '../../../src/assets/images/RL.jpg');
  let testUser;

  beforeEach(async () => {
    // Recriar o usuário de teste antes de cada teste
    testUser = await Usuario.create({
      email: 'test.user@maua.br',
      tipoUsuario: 'Jogador'
    });
  });

  beforeAll(async () => {
    // Criar usuário de teste
    testUser = await Usuario.create({
      email: 'upload-test@maua.br',
      tipoUsuario: 'Jogador'
    });
    console.log('Usuário de teste criado com ID:', testUser._id);
  });

  afterAll(async () => {
    // Limpar após os testes
    await Usuario.deleteMany({});
  });

  it('deve fazer upload de imagem para perfil de usuário', async () => {
    const response = await request(app)
      .post('/usuarios')
      .field('email', 'upload-test2@maua.br')
      .field('tipoUsuario', 'Jogador')
      .attach('fotoPerfil', testImagePath)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.usuario).toBeDefined();
  });

  it('deve atualizar foto de perfil existente', async () => {
    // Verificar se o arquivo existe
    if (!fs.existsSync(testImagePath)) {
      throw new Error(`Arquivo de teste não encontrado: ${testImagePath}`);
    }

    const response = await request(app)
      .put(`/usuarios/${testUser._id}`)
      .attach('fotoPerfil', testImagePath)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});