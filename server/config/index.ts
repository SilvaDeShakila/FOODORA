import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'foodora_dev_super_secret_sri_lanka_2026_jwt_token',
  jwtExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};
