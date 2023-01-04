const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const segredo = require('../segredo');

const verificaLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(400).json({ mensagem: 'É necessário utilizar um método de autenticação.' });
    }

    try {
        const token = authorization.replace('Bearer', '').trim();

        if (!token) {
            return res.status(400).json({ mensagem: 'Token não informado.' });
        }

        const { id } = jwt.verify(token, segredo);

        const query = 'select * from usuarios where id = $1';
        const { rows, rowCount } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'O usuário não foi encontrado.' });
        }

        const { senha, ...usuario } = rows[0];

        req.usuario = usuario;

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = verificaLogin;