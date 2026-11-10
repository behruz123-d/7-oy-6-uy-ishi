const { read_file, write_file } = require('../fs/api');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const emailSender = require('../utils/email-sender');

const getSignUp = async (req, res) => {
  try {
    res.render("register", {})
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const users = read_file('auth.json');

    const foundedEmail = users.find((u) => u.email === email);
    if (foundedEmail) {
      return res.status(400).json({
        message: 'Email already exist',
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const code = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');

    users.push({
      id: v4(),
      username,
      email,
      password: hash,
      role: 'user',
      otp: code,
      otpTime: Date.now() + 120000,
    });

    await emailSender(email, code);

    write_file('auth.json', users);
    res.status(201).render('verify', {
      message: 'Registered',
      token: null,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const users = read_file('auth.json');

    const foundedEmail = users.find((u) => u.email === email);
    if (!foundedEmail) {
      return res.status(404).json({
        message: 'Email not found',
      });
    }

    if (foundedEmail.otp !== otp) {
      return res.status(400).json({
        message: 'Wrong otp',
      });
    }

    const now = Date.now();

    if (foundedEmail.otpTime < now) {
      users.forEach((u) => {
        if (u.email === email) {
          u.otp = '';
          u.otpTime = null;
        }
        write_file('auth.json', users);
      });
      return res.status(400).json({
        message: 'Otp expired',
      });
    }

    const payload = {
      id: foundedEmail.id,
      email: foundedEmail.email,
      role: foundedEmail.role,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: '20d',
    });

    foundedEmail.otp = '';
    foundedEmail.otpTime = null;

    write_file('auth.json', users);

    return res.status(200).render('verify', {
      message: 'Verified',
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = read_file('auth.json');

    const foundedEmail = users.find((u) => u.email === email);
    if (!foundedEmail) {
      return res.status(404).json({
        message: 'Email not found',
      });
    }

    const decode = await bcrypt.compare(password, foundedEmail.password);

    if (!decode) {
      return res.status(401).json({
        message: 'Wrong password',
      });
    }

    const payload = {
      id: foundedEmail.id,
      email: foundedEmail.email,
      role: foundedEmail.role,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: '20d',
    });

    res.status(200).json({
      message: 'Success',
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  verify,
  getSignUp,
};
