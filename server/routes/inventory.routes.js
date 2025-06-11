// routes/inventory.routes.js
import express from 'express';
import {
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventory,
  deleteInventory
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.get('/', getAllInventory);
router.post('/', createInventory);
router.get('/:id', getInventoryById);
router.put('/:id', updateInventory);
router.delete('/:id', deleteInventory);

export default router;
