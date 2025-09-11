import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';


export function securityMiddleware(app){
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.disable('x-powered-by');


app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));
}