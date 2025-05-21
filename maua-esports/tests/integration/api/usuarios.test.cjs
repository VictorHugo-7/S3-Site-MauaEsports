const request = require('supertest');
const { app, Usuario, mongoose } = require('../../../backend.cjs');
const path = require('path');
const fs = require('fs');

describe('Rotas de Usuário', () => {
  let testUser;
  const testImagePath = path.join(__dirname, '../../../src/assets/images/cs2.jpg');
  let createdUsers = [];

  // Função para gerar emails válidos no formato Mauá
  function generateMauaEmail() {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const randomDigit = Math.floor(1 + Math.random() * 9);
    return `24.${randomDigits}-${randomDigit}@maua.br`;
  }

  beforeEach(async () => {
    // Limpar todos os usuários
    await Usuario.deleteMany({});

    // Criar usuário de teste com email específico
    testUser = await Usuario.create({
      email: '24.00000-0@maua.br', // Email usado apenas para testes que precisam deste usuário
      tipoUsuario: 'Jogador'
    });
  });

  beforeAll(async () => {
    // Criar usuário de teste principal
    testUser = await Usuario.create({
      email: '24.00000-0@maua.br',
      tipoUsuario: 'Jogador'
    });
    console.log('Usuário de teste criado com ID:', testUser._id);
  });

  afterEach(async () => {
    // Remove todos os usuários exceto o testUser
    await Usuario.deleteMany({ _id: { $ne: testUser._id } });
    createdUsers = [];
  });

  afterAll(async () => {
    // Limpeza final
    await Usuario.deleteMany({});
  });

  describe('POST /usuarios', () => {
    it('deve criar um novo usuário', async () => {
      // Usar um email único para este teste específico
      const newUser = {
        email: generateMauaEmail(),
        tipoUsuario: 'Jogador'
      };

      const response = await request(app)
        .post('/usuarios')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.usuario.email).toBe(newUser.email);

      // Verificar no banco de dados
      const dbUser = await Usuario.findOne({ email: newUser.email });
      expect(dbUser).not.toBeNull();
    });

    it('deve falhar ao criar usuário com email duplicado', async () => {
      // Primeiro cria o usuário
      const existingEmail = generateMauaEmail();
      await Usuario.create({
        email: existingEmail,
        tipoUsuario: 'Jogador'
      });

      const duplicateUser = {
        email: existingEmail,
        tipoUsuario: 'Jogador'
      };

      const response = await request(app)
        .post('/usuarios')
        .send(duplicateUser)
        .expect(400); // Agora deve retornar 400

      expect(response.body.message).toBe(`O email ${existingEmail} já está em uso.`);
    });

    it('deve aceitar upload de foto de perfil', async () => {
      // Verifique se o arquivo existe
      if (!fs.existsSync(testImagePath)) {
        throw new Error(`Arquivo de teste não encontrado: ${testImagePath}`);
      }

      const response = await request(app)
        .post('/usuarios')
        .field('email', generateMauaEmail())
        .field('tipoUsuario', 'Jogador')
        .attach('fotoPerfil', testImagePath)
        .expect(201);

      expect(response.body.usuario).toBeDefined();
    });
  });

  describe('GET /usuarios', () => {
    it('deve listar todos os usuários', async () => {
      // Criar alguns usuários de teste
      const users = [
        { email: '24.11111-1@maua.br', tipoUsuario: 'Jogador' },
        { email: '24.22222-2@maua.br', tipoUsuario: 'Administrador' }
      ];

      await Usuario.insertMany(users);
      createdUsers.push(...users);

      const response = await request(app)
        .get('/usuarios')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(2); // Inclui o testUser
    });
  });

  describe('GET /usuarios/:id', () => {
    it('deve retornar um usuário específico', async () => {
      // Verifica se o testUser existe no banco antes da requisição
      const dbUser = await Usuario.findById(testUser._id);
      expect(dbUser).not.toBeNull();

      const response = await request(app)
        .get(`/usuarios/${testUser._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('deve retornar 404 para usuário não encontrado', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/usuarios/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /usuarios/:id', () => {
    it('deve atualizar um usuário', async () => {
      const updates = {
        discordID: '987654321098765432'
      };

      const response = await request(app)
        .put(`/usuarios/${testUser._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.discordID).toBe(updates.discordID);
    });

    it('deve atualizar a foto de perfil', async () => {
      const response = await request(app)
        .put(`/usuarios/${testUser._id}`)
        .attach('fotoPerfil', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar no banco
      const updatedUser = await Usuario.findById(testUser._id);
      expect(updatedUser.fotoPerfil).toBeDefined();
    });
  });

  describe('GET /usuarios/:id/foto', () => {
    it('deve retornar a foto de perfil', async () => {
      // Primeiro adiciona uma foto
      await request(app)
        .put(`/usuarios/${testUser._id}`)
        .attach('fotoPerfil', testImagePath);

      const response = await request(app)
        .get(`/usuarios/${testUser._id}/foto`)
        .expect(200);

      expect(response.headers['content-type']).toBe('image/jpeg');
    });

    it('deve retornar 404 se não houver foto', async () => {
      const response = await request(app)
        .get(`/usuarios/${testUser._id}/foto`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /usuarios/:id', () => {
    it('deve remover um usuário', async () => {
      const userToDelete = await Usuario.create({
        email: generateMauaEmail(),
        tipoUsuario: 'Jogador'
      });
      createdUsers.push(userToDelete);

      const response = await request(app)
        .delete(`/usuarios/${userToDelete._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verificar se foi removido
      const deletedUser = await Usuario.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });
  });
});