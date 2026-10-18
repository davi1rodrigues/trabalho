import express from 'express';
import { listarArtistas, adicionarArtista, atualizarArtista, excluirArtista } from '../controllers/artistasController.js';

const router = express.Router();
router.get('/', listarArtistas);
router.post('/', adicionarArtista);
router.put('/:id', atualizarArtista);
router.delete('/:id', excluirArtista);

export default router;
