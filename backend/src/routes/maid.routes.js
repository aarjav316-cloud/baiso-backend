import { createMaid  , getAllMaids } from "../controllers/maid.controller.js";
import express from 'express'

const router = express.Router()

router.get('/' , getAllMaids)
router.post('/' , createMaid)

export default router

