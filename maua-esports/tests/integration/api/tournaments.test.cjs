const request = require('supertest');
const { app, Tournament } = require('../../../backend.cjs');
const path = require('path');

describe('Rotas de Campeonatos', () => {
    let testTournament;

    beforeAll(async () => {
        testTournament = await Tournament.create({
            name: 'Campeonato Teste',
            status: 'campeonatos'
        });
    });
    beforeEach(async () => {

        testTournament = await Tournament.create({
            name: 'Campeonato Teste',
            status: 'campeonatos'
        });
    });

    afterAll(async () => {
        await Tournament.deleteMany({});
    });

    it('GET /campeonatos deve retornar campeonatos', async () => {
        const res = await request(app)
            .get('/campeonatos')
            .expect(200);

        expect(res.body.campeonatos.length).toBeGreaterThan(0);
    });

    it('PATCH /campeonatos/:id/move deve mover status', async () => {
        const res = await request(app)
            .patch(`/campeonatos/${testTournament._id}/move`)
            .send({ status: 'inscricoes' })
            .expect(200);

        expect(res.body.status).toBe('inscricoes');
    });

    it('POST /campeonatos - deve criar novo campeonato com imagens', async () => {
        const newTournament = {
            name: 'Novo Campeonato',
            description: 'Descrição',
            status: 'campeonatos',
            gameName: 'Jogo Teste'
        };

        const res = await request(app)
            .post('/campeonatos')
            .field('name', newTournament.name)
            .field('description', newTournament.description)
            .field('status', newTournament.status)
            .field('gameName', newTournament.gameName)
            .attach('image', path.join(__dirname, '../../../src/assets/images/cs2.jpg'))
            .attach('gameIcon', path.join(__dirname, '../../../src/assets/images/cs2.jpg'))
            .expect(201);

        expect(res.body.name).toBe(newTournament.name);
        expect(res.body.status).toBe(newTournament.status);

    });
    it('POST /campeonatos - deve falhar ao criar campeonato sem nome', async () => {
        const newTournament = {
            description: 'Descrição',
            status: 'campeonatos'
        };

        const res = await request(app)
            .post('/campeonatos')
            .send(newTournament)
            .expect(400);

        expect(res.body.error).toBe('Nome do campeonato é obrigatório');
    });

    it('POST /campeonatos - deve falhar ao criar campeonato com status inválido', async () => {
        const newTournament = {
            name: 'Novo Campeonato',
            description: 'Descrição',
            status: 'status_invalido'
        };

        const res = await request(app)
            .post('/campeonatos')
            .send(newTournament)
            .expect(400);

        expect(res.body.error).toBe('Tournament validation failed: status: `status_invalido` is not a valid enum value for path `status`.');
    });

    describe('DELETE /campeonatos/:id', () => {
        it('deve remover um campeonato existente', async () => {
            const tempTournament = await Tournament.create({
                name: 'Torneio para Deletar',
                status: 'campeonatos'
            });

            // Verifica se existe
            const createdTournament = await Tournament.findById(tempTournament._id);
            expect(createdTournament).not.toBeNull();

            const res = await request(app)
                .delete(`/campeonatos/${tempTournament._id}`)
                .expect(200);

            expect(res.body.message).toBe("Campeonato removido com sucesso");

            // Verifica se foi removido
            const deletedTournament = await Tournament.findById(tempTournament._id);
            expect(deletedTournament).toBeNull();
        });
    });

});