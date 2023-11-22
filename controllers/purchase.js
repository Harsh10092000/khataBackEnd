import { db } from "../connect.js";

export const addPurchase = (req, res) => {
  console.log(req.body);
  const q1 =
    "INSERT INTO purchase_module (`purchase_name`,`purchase_prefix`,`purchase_prefix_no`,`purchase_amt`, `purchase_date` , sup_cnct_id , purchase_amt_paid , purchase_amt_due , purchase_amt_type ) VALUES(?)";
  const values1 = [
    req.body.purchase_name,
    req.body.purchase_prefix,
    req.body.purchase_prefix_no,
    req.body.purchase_amt,
    req.body.purchase_date,
    req.body.sup_cnct_id,
    req.body.purchase_amt_paid,
    req.body.purchase_amt_due,
    req.body.purchase_amt_type,
  ];
  db.query(q1, [values1], (err, data) => {
    if (err) return res.status(500).json(err);
    const id1 = data.insertId;
    const q2 =
      "INSERT INTO purchase_tran ( `purchase_cnct_id`, `purchase_item_name`, `purchase_item_qty`, `purchase_item_price`, `purchase_item_code` ,`purchase_item_unit` , `purchase_item_disc_unit` , `purchase_item_disc_val` , `purchase_item_disc_price` , `purchase_item_gst` , `purchase_item_gst_amt` , purchase_item_cnct_id) Values ?";
    const values2 = req.body.invoiceItemsList.map((values) => [
      id1,
      values.in_items,
      values.in_qty,
      values.in_purchase_price,
      values.in_hsn_sac,
      values.in_unit,
      values.in_discount_unit,
      values.in_discount_value,
      values.in_discount_price,
      values.in_gst_prectentage,
      values.in_gst_amt,
      values.in_id
    ]);

    db.query(q2, [values2], (err, data) => {
      if (err) return res.status(500).json(err);

      const supData =
        "INSERT INTO supplier_tran(`sup_tran_pay`,`sup_tran_date`,`sup_tran_cnct_id`, `sup_tran_pur_cnct_id`) VALUES (?)";
      const supValues = [
        req.body.purchase_amt,
        req.body.purchase_date,
        req.body.sup_cnct_id,
        id1,
      ];

      db.query(supData, [supValues], (err, data) => {
        if (err) return res.status(500).json(err);

        const q3 =
          "INSERT INTO stock_data (`product_stock_in` ,`primary_unit`, `purchase_price`,`entry_date`,`cnct_id`,`selected_unit` , `sale_cnct_id`) VALUES ?";

        const values3 = req.body.invoiceItemsList
          .filter((i) => i.in_cat === 1)
          .map((item) => [
            item.in_qty,
            item.in_unit,
            item.in_purchase_price,
            req.body.purchase_date,
            item.in_id,
            item.in_unit,
            id1
          ]);

        const cashBookData =
          "INSERT INTO cashbook_module (`cash_pay`,`cash_mode`,`cash_date`, `cash_description` , `cash_pur_cnct_id`) VALUES (?)";
        const cashBookValues = [
          req.body.purchase_amt,
          req.body.purchase_amt_type,
          req.body.purchase_date,
          req.body.purchase_desc,
          id1,
        ];

        db.query(q3, [values3], (err, data) => {
          if (err) return res.status(500).json(err);

          if (req.body.purchase_desc === "PAYMENT OUT") {
            console.log("cashBookValues1 : ", cashBookValues);
            db.query(cashBookData, [cashBookValues], (err, data) => {
              if (err) return res.status(500).json(err);
              return res.status(200).json("INSERTED SUCCESSFULLY");
            });
          } else {
            return res.status(200).json("Transaction has been Entered");
          }
        });
      });
    });
  });
};

export const updateProductStockQty = (req, res) => {
  var query = "UPDATE product_module SET balance_stock = CASE ";

  if (req.body.invoiceItemsList) {

    const cases = req.body.invoiceItemsList
    .filter((i) => i.in_cat === 1)
    .map(
      (update) =>
        `WHEN product_id = ${update.in_id} THEN '${update.in_b_stock}'`
    )
    .join(" ");
  query += `${cases} END WHERE product_id IN (${req.body.invoiceItemsList
    .map((update) => update.in_id)
    .join(", ")})`;

  } else {
    console.log("req.body.purchaseRightTranData : "  , typeof(req.body) , req.body)
     
    const cases = req.body
    .map(
      (update) =>
        `WHEN product_id = ${update.purchase_item_cnct_id} THEN purchase_item_qty + '${update.purchase_item_qty}'`
    )
    .join(" ");
  query += `${cases} END WHERE product_id IN (${req.body.purchaseRightTranData
    .map((update) => update.purchase_item_cnct_id)
    .join(", ")})`;

  }
  

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred");
    } else {
      res.send("Multiple rows updated successfully");
    }
  });
};

// export const updateServicesSalesQty = (req, res) => {
//   var query = "UPDATE service_module SET ser_sales = CASE ";
//   const cases = req.body.invoiceItemsList
//     .filter((i) => i.in_cat === 0)
//     .map(
//       (update) => `WHEN ser_id = ${update.in_id} THEN '${update.in_sales_no}'`
//     )
//     .join(" ");
//   query += `${cases} END WHERE ser_id IN (${req.body.invoiceItemsList
//     .map((update) => update.in_id)
//     .join(", ")})`;

//   db.query(query, (err, result) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send("An error occurred");
//     } else {
//       res.send("Multiple rows updated successfully");
//     }
//   });
// };

export const fetchData = (req, res) => {
  const q = "SELECT * from purchase_module";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const fetchDataById = (req, res) => {
  const q = "SELECT * from purchase_module where purchase_id = ?";
  db.query(q, [req.params.purchaseId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const fetchPurchaseTran = (req, res) => {
  const q = "SELECT * from purchase_tran WHERE purchase_cnct_id = ?";
  db.query(q, [req.params.purchaseId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const fetchPurchasePrefixData = (req, res) => {
  const q =
    "select purchase_prefix , max(CAST(purchase_prefix_no as SIGNED)) as purchase_prefix_no from purchase_module group by purchase_prefix ;";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const delPurchase = (req, res) => {
  const q =
    "DELETE purchase_module.* , purchase_tran.*, cashbook_module.*, stock_data.* , supplier_tran.* from purchase_module LEFT JOIN purchase_tran ON purchase_module.purchase_id = purchase_tran.purchase_cnct_id LEFT JOIN cashbook_module on purchase_module.purchase_id = cashbook_module.cash_pur_cnct_id LEFT JOIN supplier_tran on purchase_module.purchase_id = supplier_tran.sup_tran_pur_cnct_id LEFT JOIN stock_data on purchase_module.purchase_id = stock_data.sale_cnct_id WHERE stock_data.product_stock_in is NOT NULL and purchase_id = ? or purchase_pay_out_id = ? ;";
  db.query(q, [req.params.purchaseId, req.params.purchaseId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("DELETED SUCCESSFULLY");
  });
};

export const addPurchasePayment = (req, res) => {
  console.log("req.body :", req.body);

  const q1 =
    "INSERT INTO purchase_module (`purchase_prefix` , `purchase_prefix_no` , `purchase_name` , `purchase_date` , `sup_cnct_id` , `purchase_amt_type` ,  `purchase_amt_paid` , `purchase_pay_out_id` , `purchase_pay_out_prefix` , `purchase_pay_out_prefix_no`  ) VALUES(?)";
  const values1 = [
    req.body.purchase_prefix,
    req.body.purchase_prefix_no,
    req.body.purchase_name,
    req.body.purchase_amt_out_date,
    req.body.purchase_sup_cnct_id,
    req.body.purchase_amt_out_mode,
    req.body.purchase_amt_out,
    req.body.purchase_cnct_id,
    req.body.purchase_pay_out_prefix,
    req.body.purchase_pay_out_prefix_no,
  ];
  db.query(q1, [values1], (err, data) => {
    if (err) return res.status(500).json(err);
    const id1 = data.insertId;

    const supData =
      "INSERT INTO supplier_tran(`sup_tran_pay`,`sup_tran_date`,`sup_tran_cnct_id` , `sup_tran_pur_cnct_id`) VALUES (?)";
    const supValues = [
      req.body.purchase_amt_out,
      req.body.purchase_amt_out_date,
      req.body.purchase_sup_cnct_id,
      id1,
    ];
    db.query(supData, [supValues], (err, data) => {
      if (err) return res.status(500).json(err);
      const cashBookData =
        "INSERT INTO cashbook_module (`cash_pay`,`cash_mode`,`cash_date`, `cash_description` , `cash_pur_cnct_id`) VALUES (?)";
      const cashBookValues = [
        req.body.purchase_amt_out,
        req.body.purchase_amt_out_mode,
        req.body.purchase_amt_out_date,
        req.body.purchase_desc,
        id1,
      ];
      db.query(cashBookData, [cashBookValues], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("INSERTED SUCCESSFULLY");
      });
    });
  });
};

export const updateBalanceDue = (req, res) => {
  const q =
    "UPDATE purchase_module SET purchase_amt_paid = ? ,purchase_amt_due = ? where purchase_id = ?";
  const values = [
    req.body.amt_paid,
    req.body.amt_due,
    req.body.purchase_cnct_id,
  ];
  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Updated Successfully");
  });
};

export const fetchPurchasePayPrefixData = (req, res) => {
  const q =
    "select distinct purchase_pay_out_prefix , max(purchase_pay_out_prefix_no) as purchase_pay_out_prefix_no from purchase_module group by purchase_pay_out_prefix ORDER By purchase_pay_out_prefix = 'PaymentOut' DESC ;";
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateExpenses = (req, res) => {
  const values = [
    req.body.exp_date,
    req.body.exp_category,
    req.body.exp_total,
    req.params.expId,
  ];
  console.log(values);

  const q =
    "UPDATE expenses_module SET exp_date = ? ,exp_category = ? ,exp_total = ? WHERE exp_id = ?";

  db.query(q, values, (err, data) => {
    console.log(values);
    if (err) return res.status(500).json(err);
    return res.status(200).json("Updated Successfully");
  });
};
