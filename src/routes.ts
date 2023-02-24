import express, { Express, Request, Response, Router } from 'express';
import { register, login } from './userController';
import { test } from './mainController';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Hello, this is Express + TypeScript');
});

router.get('/test', test);
router.post('/register', register);

router.post('/login', login);

export { router };