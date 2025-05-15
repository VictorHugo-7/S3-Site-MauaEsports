const request = require('supertest');
const { app, Jogador, Time } = require('../../../backend.cjs');
const path = require('path');
const mongoose = require('mongoose');

describe('Rotas de Jogadores', () => {
    let testTime;
    let testPlayer;
    const testImagePath = path.join(__dirname, '../../../src/assets/images/cs2.jpg');

    beforeAll(async () => {
        // Limpar coleções antes de começar
        await Jogador.deleteMany({});
        await Time.deleteMany({});

        // Criar time de teste
        testTime = await Time.create({
            id: 1000,
            nome: 'Time Teste Integração'
        });

        // Criar jogador de teste com dados completos
        testPlayer = await Jogador.create({
            nome: 'Jogador Teste Integração',
            titulo: 'Título Teste',
            descricao: 'Descrição Teste',
            time: testTime.id,
            insta: 'instagram_test',
            twitter: 'twitter_test',
            twitch: 'twitch_test'
        });

        // Verificar se o jogador foi criado corretamente
        const exists = await Jogador.findById(testPlayer._id);
        if (!exists) {
            throw new Error('Falha ao criar jogador de teste no banco de dados');
        }
    });

    afterAll(async () => {
        await Jogador.deleteMany({});
        await Time.deleteMany({});
    });

    it('GET /jogadores - deve retornar lista de jogadores', async () => {
        const res = await request(app)
            .get('/jogadores')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some(j => j.nome === testPlayer.nome)).toBe(true);
    });


    it('POST /jogadores - deve criar novo jogador com imagem', async () => {
        const newPlayer = {
            nome: 'Novo Jogador',
            titulo: 'Novo Título',
            descricao: 'Nova Descrição',
            time: testTime.id
        };

        const res = await request(app)
            .post('/jogadores')
            .field('nome', newPlayer.nome)
            .field('titulo', newPlayer.titulo)
            .field('descricao', newPlayer.descricao)
            .field('time', newPlayer.time)
            .attach('foto', testImagePath)
            .expect(201);

        expect(res.body.nome).toBe(newPlayer.nome);
        expect(res.body.time).toBe(testTime.id);

        // Verifica no banco de dados
        const createdPlayer = await Jogador.findById(res.body._id);
        expect(createdPlayer).not.toBeNull();
    });

    it('GET /jogadores/:id/imagem - deve retornar a imagem do jogador', async () => {
        // Cria um jogador com imagem
        const createRes = await request(app)
            .post('/jogadores')
            .field('nome', 'Jogador com Imagem')
            .field('titulo', 'Título')
            .field('descricao', 'Descrição')
            .field('time', testTime.id)
            .attach('foto', testImagePath);

        const res = await request(app)
            .get(`/jogadores/${createRes.body._id}/imagem`)
            .expect(200);

        expect(res.headers['content-type']).toMatch(/image/);
        expect(res.body).toBeInstanceOf(Buffer);
    });


    describe('DELETE /jogadores/:id', () => {
    it('deve remover um jogador existente com sucesso', async () => {
            // Cria um jogador temporário para deletar
            const tempPlayer = await Jogador.create({
                nome: 'Jogador para Deletar',
                titulo: 'Título',
                descricao: 'Descrição',
                time: testTime.id
            });

            const res = await request(app)
                .delete(`/jogadores/${tempPlayer._id}`)
                .expect(200);

            expect(res.body).toEqual({
                message: "Jogador removido com sucesso",
                id: tempPlayer._id.toString()
            });

            // Verifica se foi realmente removido do banco
            const deletedPlayer = await Jogador.findById(tempPlayer._id);
            expect(deletedPlayer).toBeNull();
        });
  });


});