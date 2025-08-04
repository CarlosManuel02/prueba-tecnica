import { Request, Response, NextFunction } from 'express';

export function xmlBodyParser(req: Request, res: Response, next: NextFunction) {
  if (req.headers['content-type']?.includes('application/xml')) {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
}
