// mongodb+srv://antonionapoli394:<password>@o-semeador-site.s0mxq.mongodb.net/?retryWrites=true&w=majority&appName=O-Semeador-site

const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));




async function conectarAoMongoDB() {
    await mongoose.connect(process.env.MONGO_URL)
}


const usuarioSchema = mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})
usuarioSchema.plugin(uniqueValidator)
const Usuario = mongoose.model("Usuario", usuarioSchema)

const textoSchema = new mongoose.Schema({
    titulo:{type:String, required: false},
    subtitulo: { type: String, required: false },
    conteudo: { type: String, required: false }
});

const Texto = mongoose.model('Texto', textoSchema);

const imagemSchema = new mongoose.Schema({
    src: {type:String, required:true}
});

const Imagem = mongoose.model('Imagem', imagemSchema);

const parceiroSchema = new mongoose.Schema({
    src: {type:String, required:true}
});

const Parceiro = mongoose.model('Parceiro', parceiroSchema);

app.post('/signup', async (req, res) => {
    try {

        const login = req.body.login
        const password = req.body.password
        const criptografada = await bcrypt.hash(password, 10)
        const usuario = new Usuario({
            login: login,
            password: criptografada
        })
        const respMongo = await usuario.save()
        console.log(respMongo)
        res.end()
    }
    catch (error) {
        console.log(error)
        res.status(409).end()
    }

})

app.post('/login', async (req, res) => {
    //login/senha que o usuário enviou
    const login = req.body.login
    const password = req.body.password
    //tentantmos encontrar no mongoDB
    const u = await Usuario.findOne({ login: req.body.login })
    // senao foi encontrado, encerra por aqui com o cóodigo 401
    if (!u) {
        return res.status(401).json({ mensagem: "login inválido" })
    }
    //se foi encontrado, comparamos a senha, após descriptográ-la
    const senhaValida = await bcrypt.compare(password, u.password)
    if (!senhaValida) {
        return res.status(401).json({ mensagem: "Senha inválida" })
    }
    //aqui vamos gerar o token e devolver para o cliente
    const token = jwt.sign(
        { login: login },
        "chave-secreta",
        { expiresIn: "1h" }
    )
    res.status(200).json({ token: token })

})

app.post('/new-text', async (req, res) => {
    try {
        const titulo = req.body.titulo
        const subtitulo = req.body.subtitulo
        const conteudo = req.body.conteudo

        const novoTexto = new Texto({ titulo, subtitulo, conteudo })
        await novoTexto.save();
        res.status(201).json(novoTexto);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao adicionar texto', error });
    }
});

app.get('/textos-puxar', async (req, res) => {
    try {
        const textos = await Texto.find();
        res.json(textos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao recuperar textos', error });
    }
});

app.put('/textos-atualizar', async (req, res) => {
    try {
        const { id, titulo, subtitulo, conteudo } = req.body;
        const textoAtualizado = await Texto.findByIdAndUpdate(id, { titulo, subtitulo, conteudo }, { new: true });
        res.status(200).json(textoAtualizado);
    } catch (error) {
        res.status(400).json({ message: 'Erro ao atualizar texto', error });
    }
});

app.post('/imagens-adicionar', async (req, res) => {
    try {
        const novaImagem = new Imagem(req.body);
        await novaImagem.save();
        res.status(201).send(novaImagem);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para remover uma imagem
app.delete('/imagens-remover/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const imagemRemovida = await Imagem.findByIdAndDelete(id);
        if (!imagemRemovida) {
            return res.status(404).send();
        }
        res.status(200).send(imagemRemovida);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/imagens-puxar', async (req, res) => {
    try {
        const imagens = await Imagem.find();
        res.status(200).send(imagens);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.post('/parceiros-adicionar', async (req, res) => {
    try {
        const novoParceiro = new Parceiro(req.body);
        await novoParceiro.save();
        res.status(201).send(novoParceiro);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para remover uma imagem
app.delete('/parceiros-remover/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const parceiroRemovido = await Parceiro.findByIdAndDelete(id);
        if (!parceiroRemovido) {
            return res.status(404).send();
        }
        res.status(200).send(parceiroRemovido);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/parceiros-puxar', async (req, res) => {
    try {
        const parceiros = await Parceiro.find();
        res.status(200).send(parceiros);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(300, () => {
    try {
        conectarAoMongoDB()
        console.log("up and running")
    }
    catch (e) {
        console.log('Erro', e)
    }
})


