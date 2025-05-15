const mongoose = require('mongoose');
const { Admin } = require('../../../backend.cjs');

describe('Modelo Admin', () => {
  beforeAll(async () => {
    // Conexão com o banco de dados já deve estar configurada no setup.js
  });

  afterEach(async () => {
    await Admin.deleteMany({});
  });

  it('deve criar um admin válido com campos obrigatórios', async () => {
    const adminData = {
      nome: 'Admin de Teste',
      titulo: 'Título do Admin',
      descricao: 'Descrição do admin'
    };

    const admin = await Admin.create(adminData);

    expect(admin._id).toBeDefined();
    expect(admin.nome).toBe(adminData.nome);
    expect(admin.titulo).toBe(adminData.titulo);
    expect(admin.descricao).toBe(adminData.descricao);
    expect(admin.createdAt).toBeInstanceOf(Date);
  });

  it('deve falhar ao criar admin sem nome', async () => {
    const adminData = {
      titulo: 'Título sem nome',
      descricao: 'Descrição sem nome'
    };

    await expect(Admin.create(adminData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve aceitar redes sociais opcionais', async () => {
    const adminData = {
      nome: 'Admin com redes sociais',
      titulo: 'Título do admin',
      descricao: 'Descrição do admin',
      insta: 'instagram_admin',
      twitter: 'twitter_admin',
      twitch: 'twitch_admin'
    };

    const admin = await Admin.create(adminData);

    expect(admin.insta).toBe(adminData.insta);
    expect(admin.twitter).toBe(adminData.twitter);
    expect(admin.twitch).toBe(adminData.twitch);
  });

  it('deve aceitar foto como Buffer', async () => {
    // Cria um buffer de teste mais simples
    const mockImage = Buffer.from('../../src/assets/images/cs2.jpg, base64');
    
    const adminData = {
      nome: 'Admin com Foto',
      titulo: 'Título Admin',
      descricao: 'Descrição Admin',
      foto: {
        data: mockImage,
        contentType: 'image/png',
        nomeOriginal: 'foto_admin.png'
      }
    };

    const admin = await Admin.create(adminData);

    // Verificações mais robustas:
    expect(admin.foto).toBeDefined();
    expect(Buffer.isBuffer(admin.foto.data)).toBe(true);
    expect(admin.foto.data.toString()).toBe(mockImage.toString()); // Compara como string
    expect(admin.foto.contentType).toBe('image/png');
    expect(admin.foto.nomeOriginal).toBe('foto_admin.png');
  });
});