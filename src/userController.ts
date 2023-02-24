import { Request, Response } from 'express';

const register = async (req: Request, res: Response) => {
    res.send('Hello, you are in the register route');
};

const login = async (req: Request, res: Response) => {
    res.send('Hello, you are in the login route');
};

export { register, login };