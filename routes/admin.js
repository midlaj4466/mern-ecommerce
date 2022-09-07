const { response, Router } = require('express');
var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
}
/* GET users listing. */
router.get('/', function (req, res, next) {
  let admins = req.session.admins
  console.log(admins);
  if (req.session.adminLoggedIn) {
    productHelpers.getAllProducts().then((products) => {
      res.render('admin/view-products', { admins, admin: true, products })
    })
  } else {
    res.render('admin/admin-login', { admin: true })
  }
});
router.get('/add-product', verifyLogin, function (req, res) {
  let admins = req.session.admins
  res.render('admin/add-product', { admins, admin: true, })
})
router.post('/add-product', (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    console.log(id);
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.render("admin/add-product")
      } else {
        console.log(err);
      }
    })

  })

})
router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})
router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product })
})
router.post('/edit-product/:id', (req, res) => {
  console.log(req.params.id);
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
router.get('/admin-login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/')
  } else {
    res.render('admin/admin-login', { "loginErr": req.session.adminLoginErr, admin: true })
    req.session.adminLoginErr = false
  }

})
router.post('/admin-login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admins = response.admins
      req.session.adminLoggedIn = true
      res.redirect('/admin')
      console.log("Login success");
    } else {
      req.session.adminLoginErr = "Invalid username or Password"
      console.log("Login Failed!");
      res.redirect('/admin/admin-login')
    }
  })
})
router.get('/admin-logout', (req, res) => {
  req.session.admins = null
  req.session.adminLoggedIn = false
  res.redirect('/admin')
  console.log("loggedout");
})
router.get('/all-orders', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  let orders = await adminHelpers.getOrderProducts()
  let userDetails = await adminHelpers.getUserDetails(req.params.userId)
  res.render('admin/all-orders', { admins, admin: true, orders, userDetails })

})
router.get('/user-details/:userId', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  console.log(req.params.userId);
  let userDetails = await adminHelpers.getUserDetails(req.params.userId)
  console.log(userDetails);
  res.render("admin/user-details", { admins, admin: true, userDetails })
})
router.get('/user-orders/:_id', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  let orders = await adminHelpers.getUserOrders(req.params._id)
  res.render('admin/user-orders', { admins, admin: true, orders })
})
router.get('/view-order-products/:id', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  let products = await adminHelpers.getUserOrderProducts(req.params.id)
  res.render('admin/view-order-products', { admins, admin: true, products })
})
router.get('/ship-products/:id', (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.shipProduct(proId).then((response) => {
    res.redirect('/admin/all-orders')
  })
})
router.get('/delivered-products/:id', (req, res) => {
  let proId = req.params.id
  console.log(proId);
  productHelpers.deliveredProduct(proId).then((response) => {
    res.redirect('/admin/all-orders')
  })
})
router.get('/all-shipped-orders', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  let orders = await adminHelpers.getOrderProducts()
  res.render('admin/shipped-orders', { admins, admin: true, orders })
})
router.get('/all-delivered-orders', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  let orders = await adminHelpers.getOrderProducts()
  res.render('admin/delivered-orders', { admins, admin: true, orders })
})
router.get('/all-users', verifyLogin, async (req, res) => {
  let admins = req.session.admins
  let users = await adminHelpers.getAllUsers()
  res.render('admin/all-users', { admins, admin: true, users })
})
router.get('/delete-user/:id', (req, res) => {
  let userId = req.params.id
  productHelpers.deleteUser(userId).then((response) => {
    res.redirect('/admin/all-users')
  })
})
router.get('/reset-password/:id', (req, res) => {
  let userId = req.params.id
  adminHelpers.resetPassword(userId).then((response) => {
    res.redirect('/admin/all-users')
  })
})
module.exports = router;
