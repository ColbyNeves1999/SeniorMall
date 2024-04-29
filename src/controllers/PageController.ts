import { Request, Response } from 'express';

//exists to allow for transition to .ejs version of main page
async function renderMainPage(req: Request, res: Response): Promise<void> {
  const { isLoggedIn } = req.session;

  res.render(`mainPage`, { isLoggedIn });
}

export { renderMainPage };
