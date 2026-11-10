const { read_file, write_file } = require('../fs/api');
const { v4 } = require('uuid');

const getAllProducts = async (req, res) => {
  try {
    const products = read_file('product.json');
    res.status(200).render("index", {products});
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const addProduct = async (req, res) => {
  try {
    const { title, desc, price } = req.body;

    const products = read_file('product.json');

    products.push({
      id: v4(),
      title,
      desc,
      price,
    });

    write_file('product.json', products);
    res.status(302).redirect("/get_all_products")
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const getOneProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const products = read_file('product.json');

    const foundedProduct = products.find((item) => item.id === id);
    if (!foundedProduct) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.status(200).render("single", {foundedProduct})
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, desc, price } = req.body;

    const products = read_file('product.json');

    const foundedProduct = products.find((item) => item.id === id);
    if (!foundedProduct) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    products.forEach((item) => {
      if (item.id === id) {
        item.title = title ? title : item.title;
        item.desc = desc ? desc : item.desc;
        item.price = price ? price : item.price;
      }
    });

    write_file('product.json', products);
    res.status(302).redirect("/get_all_products")
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const products = read_file('product.json');

    const foundedProduct = products.find((item) => item.id === id);
    if (!foundedProduct) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    products.forEach((item, index) => {
      if (item.id === id) {
        products.splice(index, 1);
      }
    });

    write_file('product.json', products);
    res.status(302).redirect("/get_all_products")
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
};
