const request = require('supertest');
const { app, Admin } = require('../../../backend.cjs');

describe('Rotas de Admin', () => {
    let testAdmin;

    beforeAll(async () => {
        testAdmin = await Admin.create({
            nome: 'Admin Teste',
            titulo: 'Título',
            descricao: 'Descrição'
        });
    });

    afterAll(async () => {
        await Admin.deleteMany({});
    });

    it('GET /admins deve retornar admins', async () => {
        const res = await request(app)
            .get('/admins')
            .expect(200);

        expect(res.body.length).toBeGreaterThan(0);
    });

    it('POST /admins deve criar novo admin', async () => {
        const res = await request(app)
            .post('/admins')
            .send({
                nome: 'Novo Admin',
                titulo: 'Título',
                descricao: 'Descrição'
            })
            .expect(201);

        expect(res.body.admin.nome).toBe('Novo Admin');
    });

    describe('DELETE /admins/:id', () => {
        it('deve remover um admin existente', async () => {
            const tempAdmin = await Admin.create({
                nome: 'Admin para Deletar',
                titulo: 'Título',
                descricao: 'Descrição'
            });

            // Verifica se o admin foi criado
            const createdAdmin = await Admin.findById(tempAdmin._id);
            expect(createdAdmin).not.toBeNull();

            const res = await request(app)
                .delete(`/admins/${tempAdmin._id}`)
                .expect(200);

            expect(res.body.success).toBe(true);

            // Verifica se foi realmente removido
            const deletedAdmin = await Admin.findById(tempAdmin._id);
            expect(deletedAdmin).toBeNull();
        });

    });
});