const mongoose = require('mongoose');
const { Jogador, Time } = require('../../../backend.cjs');

describe('Modelo Jogador', () => {
  let timeTeste;

  beforeAll(async () => {
    // Cria um time de teste para associar aos jogadores
    timeTeste = await Time.create({
      id: 999,
      nome: 'Time de Teste para Jogadores'
    });
  });

  afterEach(async () => {
    await Jogador.deleteMany({});
  });

  afterAll(async () => {
    await Time.deleteMany({});
  });

  it('deve criar um jogador válido com campos obrigatórios', async () => {
    const jogadorData = {
      nome: 'Jogador de Teste',
      titulo: 'Título do Jogador',
      descricao: 'Descrição do jogador',
      time: timeTeste.id
    };

    const jogador = await Jogador.create(jogadorData);

    expect(jogador._id).toBeDefined();
    expect(jogador.nome).toBe(jogadorData.nome);
    expect(jogador.titulo).toBe(jogadorData.titulo);
    expect(jogador.descricao).toBe(jogadorData.descricao);
    expect(jogador.time).toBe(timeTeste.id);
    expect(jogador.createdAt).toBeInstanceOf(Date);
  });

  it('deve falhar ao criar jogador sem nome', async () => {
    const jogadorData = {
      titulo: 'Título sem nome',
      descricao: 'Descrição sem nome',
      time: timeTeste.id
    };

    await expect(Jogador.create(jogadorData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve falhar ao criar jogador sem time', async () => {
    const jogadorData = {
      nome: 'Jogador sem time',
      titulo: 'Título do jogador',
      descricao: 'Descrição do jogador'
    };

    await expect(Jogador.create(jogadorData))
      .rejects
      .toThrow(mongoose.Error.ValidationError);
  });

  it('deve aceitar redes sociais opcionais', async () => {
    const jogadorData = {
      nome: 'Jogador com redes sociais',
      titulo: 'Título do jogador',
      descricao: 'Descrição do jogador',
      time: timeTeste.id,
      insta: 'instagram_user',
      twitter: 'twitter_user',
      twitch: 'twitch_user'
    };

    const jogador = await Jogador.create(jogadorData);

    expect(jogador.insta).toBe(jogadorData.insta);
    expect(jogador.twitter).toBe(jogadorData.twitter);
    expect(jogador.twitch).toBe(jogadorData.twitch);
  });
  it('deve aceitar foto como Buffer', async () => {
    const mockImage = Buffer.from('../../src/assets/images/cs2.jpg, base64');

    const jogadorData = {
      nome: 'Jogador com Foto',
      titulo: 'Título do Jogador',
      descricao: 'Descrição do jogador',
      time: timeTeste.id,
      foto: {
        data: mockImage,
        contentType: 'image/png',
        nomeOriginal: 'foto_jogador.png'
      }
    };

    const jogador = await Jogador.create(jogadorData);

    // Verificações robustas:
    expect(jogador.foto).toBeDefined();
    expect(Buffer.isBuffer(jogador.foto.data)).toBe(true);
    expect(jogador.foto.data.toString()).toBe(mockImage.toString());
    expect(jogador.foto.contentType).toBe('image/png');
    expect(jogador.foto.nomeOriginal).toBe('foto_jogador.png');
  });
});