import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/env.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });
    res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name.trim();
    await user.save();
    res.status(200).json({ message: 'Profile updated', user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};
