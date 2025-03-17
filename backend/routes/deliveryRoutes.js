const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const { protect } = require('../middleware/authMiddleware');
// 📦 Marquer une commande comme expédiée
router.post("/ship/:deliveryId", deliveryController.shipOrder);

// ✅ Confirmer la réception de l'article
router.post("/confirm/:deliveryId",protect, deliveryController.confirmDelivery);

// 🔍 Récupérer les détails d'une livraison
router.get("/:deliveryId",protect, deliveryController.getDeliveryDetails);

// 📦 Récupérer les ventes en cours d'un vendeur
router.get("/users/:userId/sales",protect, deliveryController.getSellerSales);

//Récupérer les achats
router.get("/users/:userId/purchases", protect, deliveryController.getBuyerPurchases);

//confirmer l'adresse 
router.put('/confirm-address/:deliveryId', protect, deliveryController.confirmAddress);

//afficher l'adresse au vendeur 
router.get('/get-address/:deliveryId', protect, deliveryController.getBuyerAddress);





module.exports = router;
