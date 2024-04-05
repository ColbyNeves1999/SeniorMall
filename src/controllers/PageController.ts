import { Request, Response } from 'express';

async function renderMainPage(req: Request, res: Response): Promise<void> {

    const { isLoggedIn } = req.session;

    res.render(`mainPage`, { isLoggedIn });

}

export { renderMainPage };