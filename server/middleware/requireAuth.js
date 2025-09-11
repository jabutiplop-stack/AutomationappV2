export function requireAuth(){
    return async (req, res, next) => {
    const sid = req.cookies?.sid;
    if(!sid) return res.status(401).json({ error: 'Brak sesji' });
    const session = await req.ctx.getSession(sid);
    if(!session) return res.status(401).json({ error: 'Sesja nieważna' });
    req.user = { id: session.userId };
    // (opcjonalnie) rotacja/odświeżenie TTL
    next();
    };
    }