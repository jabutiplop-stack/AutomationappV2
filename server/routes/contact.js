import { Router } from 'express';
import { contactSchema } from '../util/validator.js';


const router = Router();
router.post('/', async (req, res) => {
const parsed = contactSchema.safeParse(req.body);
if(!parsed.success) return res.status(400).json({ error: 'Uzupełnij poprawnie wszystkie pola' });
const { name, email, message } = parsed.data;
// TODO: zapisz do bazy / wyślij maila. Demo – brak wrażliwych danych w logach produkcyjnych
console.log('Kontakt (demo):', { name, email, len: message.length });
res.json({ ok: true });
});
export default router;