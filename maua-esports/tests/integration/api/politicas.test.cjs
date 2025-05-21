const request = require('supertest');
const { app,  Politicas, mongoose } = require('../../../backend.cjs');



// Testes para Políticas
  describe('Rotas de Políticas (/politicas)', () => {
    describe('GET /politicas', () => {
      it('deve listar todas as políticas', async () => {
        await Politicas.create([
          { titulo: 'Política 1', descricao: 'Descrição 1' },
          { titulo: 'Política 2', descricao: 'Descrição 2' },
        ]);

        const response = await request(app)
          .get('/politicas')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.politicas.length).toBe(2);
        expect(response.body.politicas[0].titulo).toBe('Política 1');
      });
    });

    describe('POST /politicas', () => {
      it('deve criar uma nova política', async () => {
        const novaPolitica = {
          titulo: 'Nova Política',
          descricao: 'Descrição da nova política',
        };

        const response = await request(app)
          .post('/politicas')
          .send(novaPolitica)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.politica.titulo).toBe(novaPolitica.titulo);

        // Verificar no banco
        const dbPolitica = await Politicas.findOne({ titulo: novaPolitica.titulo });
        expect(dbPolitica).not.toBeNull();
      });

      it('deve falhar se título estiver ausente', async () => {
        const response = await request(app)
          .post('/politicas')
          .send({ descricao: 'Descrição sem título' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors[0].msg).toBe('O título é obrigatório');
      });
    });

    describe('PUT /politicas/:id', () => {
      it('deve atualizar uma política', async () => {
        const politica = await Politicas.create({
          titulo: 'Política Antiga',
          descricao: 'Descrição Antiga',
        });

        const updates = {
          titulo: 'Política Atualizada',
          descricao: 'Descrição Atualizada',
        };

        const response = await request(app)
          .put(`/politicas/${politica._id}`)
          .send(updates)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.politica.titulo).toBe(updates.titulo);

        // Verificar no banco
        const dbPolitica = await Politicas.findById(politica._id);
        expect(dbPolitica.titulo).toBe(updates.titulo);
      });

      it('deve retornar 404 se política não existir', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/politicas/${fakeId}`)
          .send({ titulo: 'Teste', descricao: 'Teste' })
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Política não encontrada');
      });
    });

    describe('DELETE /politicas/:id', () => {
      it('deve excluir uma política', async () => {
        const politica = await Politicas.create({
          titulo: 'Política para Excluir',
          descricao: 'Descrição',
        });

        const response = await request(app)
          .delete(`/politicas/${politica._id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Política excluída com sucesso!');

        // Verificar no banco
        const dbPolitica = await Politicas.findById(politica._id);
        expect(dbPolitica).toBeNull();
      });

      it('deve retornar 404 se política não existir', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .delete(`/politicas/${fakeId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Política não encontrada');
      });
    });
  });