import { Request, Response, NextFunction } from 'express';

export function requireAdminSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-admin-secret'] as string | undefined;
  const expectedSecret = process.env.ADMIN_SECRET || 'changeme';

  if (!secret || secret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
