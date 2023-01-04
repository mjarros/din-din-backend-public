const conexao = require("../conexao");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const segredo = require("../segredo");

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório!" });
  }

  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório!" });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório!" });
  }

  try {
    const consulta = await conexao.query("select * from usuarios where email = $1", [email]);

    if (consulta.rowCount > 0) {
      return res.status(400).json({ mensagem: "Já existe usuário com o e-mail informado." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const insercao = await conexao.query("insert into usuarios (nome, email, senha) values ($1, $2, $3)", [nome, email, senhaCriptografada]);

    if (insercao.rowCount === 0) {
      return res.status(400).json({ mensagem: "Não foi possível cadastrar o usuário." });
    }

    const { rows } = await conexao.query("select * from usuarios where email = $1", [email]);

    const usuario = rows[0];

    const { senha: senhaUsuario, ...dadosUsuario } = usuario;

    return res.status(200).json(dadosUsuario);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const efetuarLogin = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios!" });
  }

  try {
    const queryConsultaEmail = "select * from usuarios where email = $1";
    const { rows, rowCount } = await conexao.query(queryConsultaEmail, [email]);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const usuario = rows[0];

    const senhaVerificada = await bcrypt.compare(senha, usuario.senha);

    if (!senhaVerificada) {
      return res.status(401).json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const token = jwt.sign({ id: usuario.id }, segredo, { expiresIn: "8h" });

    const { senha: senhaUsuario, ...dadosUsuario } = usuario;

    return res.status(200).json({
      usuario: dadosUsuario,
      token,
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const detalharPerfilUsuario = async (req, res) => {
  const { usuario } = req;

  try {
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const atualizarPerfilUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;
  const { usuario } = req;

  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório!" });
  }

  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório!" });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório!" });
  }

  try {
    const consulta = await conexao.query("select * from usuarios where id != $1 and email = $2", [usuario.id, email]);

    if (consulta.rowCount > 0) {
      return res.status(400).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const update = await conexao.query("update usuarios set nome = $1, email = $2, senha = $3 where id = $4", [nome, email, senhaCriptografada, usuario.id]);

    if (update.rowCount === 0) {
      return res.status(400).json({ mensagem: "Não foi possível atualizar o usuário." });
    }

    return res.status(200).json();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  cadastrarUsuario,
  efetuarLogin,
  detalharPerfilUsuario,
  atualizarPerfilUsuario,
};
