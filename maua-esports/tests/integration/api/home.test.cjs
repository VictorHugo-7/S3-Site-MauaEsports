const request = require('supertest');
const { app, Novidade, Apresentacao, Politicas, Usuario, mongoose } = require('../../../backend.cjs');
const path = require('path');
const fs = require('fs');

describe('Rotas de Homepage', () => {
    let testImagePath = path.join(__dirname, '../../../src/assets/images/cs2.jpg'); // Ajuste o caminho conforme necessário

    beforeAll(async () => {
        // Configurar MongoMemoryServer já está no setup do código fornecido
    });

    afterAll(async () => {
        // Limpeza já está no setup do código fornecido
    });

    afterEach(async () => {
        // Limpar coleções após cada teste
        await Novidade.deleteMany({});
        await Apresentacao.deleteMany({});
        await Politicas.deleteMany({});
        await Usuario.deleteMany({});
    });

    // Função auxiliar para verificar se o arquivo de teste existe
    const checkImageExists = () => {
        if (!fs.existsSync(testImagePath)) {
            throw new Error(`Arquivo de teste não encontrado: ${testImagePath}`);
        }
    };

    // Função auxiliar para gerar email válido no formato Mauá
    function generateMauaEmail() {
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        const randomDigit = Math.floor(1 + Math.random() * 9);
        return `24.${randomDigits}-${randomDigit}@maua.br`;
    }

    // Testes para Homepage - Novidade
    describe('Rotas de Homepage - Novidade (/api/homeNovidade)', () => {
        describe('GET /api/homeNovidade', () => {
            it('deve retornar a novidade existente', async () => {
                const novidadeData = {
                    titulo: 'Novidade Teste',
                    subtitulo: 'Subtítulo Teste',
                    descricao: 'Descrição da novidade teste',
                    nomeBotao: 'Saiba Mais',
                    urlBotao: 'http://example.com',
                    imagem: fs.readFileSync(testImagePath),
                    imagemType: 'image/jpeg',
                };
                await Novidade.create(novidadeData);

                const response = await request(app)
                    .get('/api/homeNovidade')
                    .expect(200);

                expect(response.body.titulo).toBe(novidadeData.titulo);
                expect(response.body.imagem).toContain('data:image/jpeg;base64');
            });

            it('deve retornar 404 se não houver novidade', async () => {
                const response = await request(app)
                    .get('/api/homeNovidade')
                    .expect(404);

                expect(response.body.message).toBe('Nenhuma novidade encontrada');
            });
        });

        describe('POST /api/homeNovidade', () => {
            it('deve criar uma nova novidade com imagem', async () => {
                checkImageExists();

                const response = await request(app)
                    .post('/api/homeNovidade')
                    .field('titulo', 'Nova Novidade')
                    .field('subtitulo', 'Subtítulo')
                    .field('descricao', 'Descrição da novidade')
                    .field('nomeBotao', 'Clique Aqui')
                    .field('urlBotao', 'http://example.com')
                    .attach('imagem', testImagePath)
                    .expect(200);

                expect(response.body.titulo).toBe('Nova Novidade');
                expect(response.body.imagem).toContain('data:image/jpeg;base64');

                // Verificar no banco
                const dbNovidade = await Novidade.findOne({ titulo: 'Nova Novidade' });
                expect(dbNovidade).not.toBeNull();
            });

            it('deve falhar se título ou descrição estiverem ausentes', async () => {
                const response = await request(app)
                    .post('/api/homeNovidade')
                    .field('subtitulo', 'Subtítulo')
                    .expect(400);

                expect(response.body.message).toBe('Título e descrição são obrigatórios');
            });

            it('deve atualizar uma novidade existente', async () => {
                checkImageExists();
                await Novidade.create({
                    titulo: 'Novidade Antiga',
                    subtitulo: 'Subtítulo Antigo',
                    descricao: 'Descrição Antiga',
                    imagem: fs.readFileSync(testImagePath),
                    imagemType: 'image/jpeg',
                });

                const response = await request(app)
                    .post('/api/homeNovidade')
                    .field('titulo', 'Novidade Atualizada')
                    .field('subtitulo', 'Subtítulo Novo')
                    .field('descricao', 'Descrição Atualizada')
                    .field('nomeBotao', 'Novo Botão')
                    .field('urlBotao', 'http://newexample.com')
                    .attach('imagem', testImagePath)
                    .expect(200);

                expect(response.body.titulo).toBe('Novidade Atualizada');
                expect(response.body.subtitulo).toBe('Subtítulo Novo');

                // Verificar no banco
                const dbNovidade = await Novidade.findOne({ titulo: 'Novidade Atualizada' });
                expect(dbNovidade).not.toBeNull();
                expect(dbNovidade.subtitulo).toBe('Subtítulo Novo');
            });
        });

    });
    // Testes para Homepage - Apresentação
    describe('Rotas de Homepage - Apresentação (/api/apresentacao)', () => {
        describe('GET /api/apresentacao', () => {
            it('deve retornar a apresentação existente', async () => {
                const apresentacaoData = {
                    titulo1: 'Título 1',
                    titulo2: 'Título 2',
                    descricao1: 'Descrição 1',
                    descricao2: 'Descrição 2',
                    botao1Nome: 'Botão 1',
                    botao1Link: 'http://example1.com',
                    botao2Nome: 'Botão 2',
                    botao2Link: 'http://example2.com',
                    imagem: fs.readFileSync(testImagePath),
                    imagemType: 'image/jpeg',
                    icones: [
                        { id: 1, imagem: fs.readFileSync(testImagePath), imagemType: 'image/jpeg', link: 'http://icone1.com' },
                    ],
                };
                await Apresentacao.create(apresentacaoData);

                const response = await request(app)
                    .get('/api/apresentacao')
                    .expect(200);

                expect(response.body.titulo1).toBe(apresentacaoData.titulo1);
                expect(response.body.imagem).toContain('data:image/jpeg;base64');
                expect(response.body.icones[0].link).toBe('http://icone1.com');
            });

            it('deve retornar 404 se não houver apresentação', async () => {
                const response = await request(app)
                    .get('/api/apresentacao')
                    .expect(404);

                expect(response.body.message).toBe('Nenhuma apresentação encontrada');
            });
        });

        describe('POST /api/apresentacao', () => {
            it('deve criar uma nova apresentação com imagem e ícones', async () => {
                checkImageExists();
                const icones = [{ id: 1, link: 'http://icone1.com' }];

                const response = await request(app)
                    .post('/api/apresentacao')
                    .field('titulo1', 'Título 1')
                    .field('titulo2', 'Título 2')
                    .field('descricao1', 'Descrição 1')
                    .field('descricao2', 'Descrição 2')
                    .field('botao1Nome', 'Botão 1')
                    .field('botao1Link', 'http://example1.com')
                    .field('botao2Nome', 'Botão 2')
                    .field('botao2Link', 'http://example2.com')
                    .field('icones', JSON.stringify(icones))
                    .attach('imagem', testImagePath)
                    .attach('icones', testImagePath)
                    .expect(200);

                expect(response.body.titulo1).toBe('Título 1');
                expect(response.body.imagem).toContain('data:image/jpeg;base64');
                expect(response.body.icones[0].link).toBe('http://icone1.com');

                // Verificar no banco
                const dbApresentacao = await Apresentacao.findOne({ titulo1: 'Título 1' });
                expect(dbApresentacao).not.toBeNull();
            });

            it('deve falhar se campos obrigatórios estiverem ausentes', async () => {
                const response = await request(app)
                    .post('/api/apresentacao')
                    .field('titulo1', 'Título 1')
                    .expect(400);

                expect(response.body.message).toBe('Todos os campos são obrigatórios');
            });

            it('deve atualizar uma apresentação existente', async () => {
                checkImageExists();
                await Apresentacao.create({
                    titulo1: 'Título Antigo',
                    titulo2: 'Título 2',
                    descricao1: 'Descrição Antiga',
                    descricao2: 'Descrição 2',
                    botao1Nome: 'Botão 1',
                    botao1Link: 'http://example1.com',
                    botao2Nome: 'Botão 2',
                    botao2Link: 'http://example2.com',
                    imagem: fs.readFileSync(testImagePath),
                    imagemType: 'image/jpeg',
                    icones: [{ id: 1, imagem: fs.readFileSync(testImagePath), imagemType: 'image/jpeg', link: 'http://icone1.com' }],
                });

                const icones = [{ id: 1, link: 'http://icone-novo.com' }];

                const response = await request(app)
                    .post('/api/apresentacao')
                    .field('titulo1', 'Título Atualizado')
                    .field('titulo2', 'Título 2')
                    .field('descricao1', 'Descrição Atualizada')
                    .field('descricao2', 'Descrição 2')
                    .field('botao1Nome', 'Botão 1')
                    .field('botao1Link', 'http://example1.com')
                    .field('botao2Nome', 'Botão 2')
                    .field('botao2Link', 'http://example2.com')
                    .field('icones', JSON.stringify(icones))
                    .attach('imagem', testImagePath)
                    .attach('icones', testImagePath)
                    .expect(200);

                expect(response.body.titulo1).toBe('Título Atualizado');
                expect(response.body.icones[0].link).toBe('http://icone-novo.com');

                // Verificar no banco
                const dbApresentacao = await Apresentacao.findOne({ titulo1: 'Título Atualizado' });
                expect(dbApresentacao).not.toBeNull();
            });
        });
    });
});
