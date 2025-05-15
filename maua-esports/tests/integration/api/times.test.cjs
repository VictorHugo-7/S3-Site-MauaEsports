const request = require('supertest');
const { app, Time } = require('../../../backend.cjs');
const path = require('path');

describe('Rotas de Times', () => {
    let testTime;

    beforeAll(async () => {
        testTime = await Time.create({
            id: 1000,
            nome: 'Time Teste'
        });
    });

    afterAll(async () => {
        await Time.deleteMany({});
    });

    it('GET /times deve retornar times', async () => {
        const res = await request(app)
            .get('/times')
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
    });

    it('POST /times deve criar novo time', async () => {
        const res = await request(app)
            .post('/times')
            .field('id', 1001)
            .field('nome', 'Novo Time')
            .attach('foto', path.join(__dirname, '../../../src/assets/images/cs2.jpg'))
            .attach('jogo', path.join(__dirname, '../../../src/assets/images/cs2.jpg'))
            .expect(201);

        expect(res.body.id).toBe(1001);
    });
    describe('DELETE /times/:id', () => {
        it('deve remover um times', async () => {
            const tempTime = await Time.create({
                id: 9999,
                nome: 'Time para Deletar'
            });

            // Verifica se o time existe
            const createdTime = await Time.findOne({ id: tempTime.id });
            expect(createdTime).not.toBeNull();

            const res = await request(app)
                .delete(`/times/${tempTime.id}`)
                .expect(200);

            expect(res.body.message).toBe("Time removido com sucesso");

            // Verifica se foi removido
            const deletedTime = await Time.findOne({ id: tempTime.id });
            expect(deletedTime).toBeNull();
        });
    });
});