const Profile = require('../models/profile');
const User = require('../models/user');
const message = require('../messages/profile');

const SQL = require('../helper/SQL');

exports.list = async function (req, res) {
  try {
    const response = await Profile.listProfile();

    return res.json(response);
  } catch (err) {
    
    //! Erro Internal Server
    return res.status(400).json({
      result: 'error',
      message: message.error.code1.subcode99.message,
      error: err.toString(),
    });
  }
}

exports.create = async function (req, res) {
  try {
    const body = req.body;

    const response = await Profile.insertProfile(body.nome);

    const sqlTreated = await SQL.build(response);

    //! Erro ao executar query no banco
    if (sqlTreated.result === 'error') {

      //! Erro de cadastro duplicado
      if (sqlTreated.errno === 1062) {
        return res.json({
          result: 'error',
          message: message.error.code1.subcode1.message
        })
      }
    }

    //* Query executada com sucesso
    if (sqlTreated.result === 'success') {
      return res.json({
        result: 'success',
        message: message.success.code1.subcode1.message
      })
    }

    return res.json(sqlTreated);
  } catch (err) {
    
    //! Erro Internal Server
    return res.status(400).json({
      result: 'error',
      message: message.error.code1.subcode99.message,
      error: err.toString(),
    });
  }
}

exports.update = async function (req, res) {
  try {
    const body = req.body;

    const profile = {
      nome: body.nome,
      updated_at: new Date(),
      id_perfil: body.id_perfil
    }

    const response = await Profile.updateProfile(profile);

    const sqlTreated = await SQL.build(response);

    //! Erro ao executar query no banco
    if (sqlTreated.result === 'error') {

      //! Erro de cadastro duplicado
      if (sqlTreated.errno === 1062) {
        return res.json({
          result: sqlTreated.result,
          message: message.error.code1.subcode1.message
        })
      }
    }

    //* Query executada com sucesso
    if (sqlTreated.result === 'success') {

      //* Nenhum usuário encontrado com os parâmetros passados
      if (sqlTreated.sql.affectedRows === 0) {
        return res.json({
          result: 'error',
          message: message.error.code1.subcode2.message
        })
      }

      return res.json({
        result: sqlTreated.result,
        message: message.success.code1.subcode2.message
      })
    }

    return res.json(sqlTreated);
  } catch (err) {
    
    //! Erro Internal Server
    return res.status(400).json({
      result: 'error',
      message: message.error.code1.subcode99.message,
      error: err.toString(),
    });
  }
}

exports.delete = async function (req, res) {
  try {
    const { id_perfil } = req.body;

    const users = await User.findByProfile(id_perfil);

    //* Existem usuários atrelados a este perfil
    if (users[0]) {
      return res.json({
        result: 'error',
        message: message.error.code1.subcode3.message
      })
    }

    const response = await Profile.deleteProfile(id_perfil);

    const sqlTreated = await SQL.build(response);

    //! Erro ao executar query no banco
    if (sqlTreated.result === 'error') {
      return res.json(sqlTreated)
    }

    //* Query executada com sucesso
    if (sqlTreated.result === 'success') {

      //* Nenhum usuário encontrado com os parâmetros passados
      if (sqlTreated.sql.affectedRows === 0) {
        return res.json({
          result: 'error',
          message: message.error.code1.subcode2.message
        })
      }

      return res.json({
        result: 'success',
        message: message.success.code1.subcode3.message
      });
    }

    return res.json(sqlTreated);
  } catch (err) {

    //! Internal Server Error
    return res.status(400).json({
      result: 'error',
      message: message.error.code1.subcode99.message,
      error: err.toString(),
    });
  }
}
