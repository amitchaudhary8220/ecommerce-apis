const getAllOrders = async (req, res) => {
  res.send("get all orders");
};

const getSingleOrder = async function (req, res) {
  res.send("get single orders");
};

const getCurrentUserOrders = async function (req, res) {
  res.send("get current user orders");
};

const createOrder = async function (req, res) {
    
  res.send("crete orders");
};

const updateOrder = async function (req, res) {
  res.send("update orders");
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
