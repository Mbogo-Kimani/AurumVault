const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middlewares/auth');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', auth, adminOnly, authController.getAllUsers);
router.put('/users/:id', auth, adminOnly, authController.editUser);
router.delete('/users/:id', auth, adminOnly, authController.deleteUser);


module.exports = router;
