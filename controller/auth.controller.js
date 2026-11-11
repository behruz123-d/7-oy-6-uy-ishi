const { read_file, write_file } = require('../fs/api');
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const emailSender = require('../utils/email-sender');

// JSON yuborilgan bo'lsa (Postman raw JSON) -> JSON javob, aks holda (HTML forma) -> sahifa
const isJson = (req) => req.is('application/json');

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: '20d' }
  );

const getSignUp = async (req, res) => {
  try {
    res.render('register', {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'username, email and password are required',
      });
    }

    const users = read_file('auth.json');

    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ message: 'Email already exist' });
    }

    const hash = await bcrypt.hash(password, 12);
    const code = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');

    users.push({
      id: v4(),
      username,
      email,
      password: hash,
      role: 'user',
      verified: false,
      otp: code,
      otpTime: Date.now() + 120000, // 2 daqiqa
    });

    await emailSender(email, code);
    write_file('auth.json', users);

    if (isJson(req)) {
      return res.status(201).json({ message: 'Registered. Check your email for the code' });
    }
    res.status(201).render('verify', { message: 'Registered', token: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ message: 'email and otp are required' });
    }

    const users = read_file('auth.json');
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (user.otp !== String(otp)) {
      return res.status(400).json({ message: 'Wrong otp' });
    }

    if (user.otpTime < Date.now()) {
      user.otp = '';
      user.otpTime = null;
      write_file('auth.json', users);
      return res.status(400).json({ message: 'Otp expired' });
    }

    user.verified = true;
    user.otp = '';
    user.otpTime = null;
    write_file('auth.json', users);

    const token = makeToken(user);

    if (isJson(req)) {
      return res.status(200).json({ message: 'Verified', token });
    }
    res.status(200).render('verify', { message: 'Verified', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const users = read_file('auth.json');
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    if (!user.verified) {
      return res.status(403).json({ message: 'Email is not verified. Use /verify first' });
    }

    res.status(200).json({ message: 'Success', token: makeToken(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, verify, getSignUp };
