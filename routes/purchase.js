import express from "express";
import {
  fetchData,
  fetchDataById,
  fetchPurchaseTran,
  delPurchase,
  addPurchase,
  updateProductStockQty,
  addPurchasePayment,
  //fetchPaymentPrefixData,
  fetchPurchasePrefixData,
  fetchPurchasePayPrefixData,
  updateBalanceDue
} from "../controllers/purchase.js";


const router = express.Router();

router.post("/addPurchasePayment", addPurchasePayment);
router.post("/addPurchase", addPurchase);
router.put("/updateProductStockQty" , updateProductStockQty);
router.get("/fetchData", fetchData);
router.get("/fetchDataById/:purchaseId", fetchDataById);
router.get("/fetchPurchaseTran/:purchaseId", fetchPurchaseTran);
router.delete("/delPurchase/:purchaseId", delPurchase);
// router.get("/fetchSalesPrefixData", fetchSalesPrefixData);
// router.put("/updateServicesSalesQty" , updateServicesSalesQty);
//router.get("/fetchPaymentPrefixData", fetchPaymentPrefixData);
router.get("/fetchPurchasePayPrefixData", fetchPurchasePayPrefixData);
router.get("/fetchPurchasePrefixData", fetchPurchasePrefixData);
router.put("/updateBalanceDue" , updateBalanceDue);

export default router;
