import { config } from 'dotenv';
config();

export const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES,
}

export const registerConfig = {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD
}