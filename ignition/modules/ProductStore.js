const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ProductStoreModule", (m) => {
  const productStore = m.contract("ProductStore");
  return { productStore };
});