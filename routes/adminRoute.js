const express=require('express');
const adminRoute = express();
const adminController =require('../controllers/adminController');
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const bannerController = require('../controllers/bannerController')
const categoryController = require('../controllers/categoryController')
const couponController = require('../controllers/couponController')
const orderController = require('../controllers/orderController')

const auth = require('../middleware/auth')
const bodyParser = require('body-parser');
const Upload = require('../helpers/multer');
const morgan = require('morgan');
adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/adminViews');
adminRoute.use(morgan('dev'))
adminRoute.use(express.json());
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({extended:true}));

adminRoute.get('/admin',auth.adminLogin,adminController.loadAdminLogin);
adminRoute.post('/admin',adminController.loginAdmin)
adminRoute.get('/admin/dashboard',auth.adminLogin,adminController.adminDashboard)
adminRoute.get('/admin/dash',auth.adminLogin,adminController.loadDashboard)
adminRoute.get('/admin/users',auth.adminLogin,userController.userLoad);
adminRoute.post('/admin/users/block',userController.blockUser);
adminRoute.post('/admin/users/unblock',userController.unBlockUser);
adminRoute.get('/admin/category',auth.adminLogin,categoryController.categoryLoad);
adminRoute.get('/admin/addCategory',auth.adminLogin,categoryController.addCategory);
adminRoute.post('/admin/addCategory',Upload.single('file'), categoryController.categoryAdding);
adminRoute.post('/admin/deleteCategory',auth.adminLogin,categoryController.deleteCategory);
adminRoute.get('/admin/editCategory',auth.adminLogin,categoryController.editCategory)
adminRoute.post('/admin/editCategory',Upload.single('file') ,categoryController.saveEditedCategory);
adminRoute.get('/admin/product',auth.adminLogin,productController.productLoad)
adminRoute.get('/admin/addProduct',auth.adminLogin,productController.addProduct)
adminRoute.post('/admin/addProduct',Upload.array('images',3),productController.SaveAddProduct)
adminRoute.get('/admin/editProduct',auth.adminLogin,productController.editProduct);
adminRoute.post('/admin/editProduct',Upload.array('images',3),productController.saveEditedProduct);
adminRoute.post('/admin/deleteProduct',productController.deleteProduct);
adminRoute.get('/admin/coupon',auth.adminLogin,couponController.laodCoupon);
adminRoute.get('/admin/addCoupon',auth.adminLogin,couponController.addCoupon);
adminRoute.post('/admin/addCoupon',auth.adminLogin,couponController.saveAddCoupon);
adminRoute.get('/admin/orders',auth.adminLogin,orderController.loadOrders);
adminRoute.get('/admin/banner',auth.adminLogin,bannerController.loadBanner);
adminRoute.get('/admin/addBanner',auth.adminLogin,bannerController.addBanner);
adminRoute.post('/admin/deleteBanner',auth.adminLogin,bannerController.deleteBanner);
adminRoute.post('/admin/banner/changeStatus',bannerController.bannerChangeStatus);
adminRoute.post('/admin/addBanner',Upload.single('file'),bannerController.saveBanner);
adminRoute.get('/admin/offer',auth.adminLogin,productController.loadOffer)
adminRoute.get('/admin/addOffer',auth.adminLogin,productController.addOffer)
adminRoute.post('/admin/addOffer',productController.saveProductOffer)

// adminRoute.get('/admin/viewOrder',auth.adminLogin,adminController.viewSingleOrder);
adminRoute.get('/admin/order-details',auth.adminLogin,orderController.viewSingleOrder)
adminRoute.get('/admin/change-status',auth.adminLogin,orderController.changeStatus);
adminRoute.get('/admin/cancel-order',auth.adminLogin,orderController.cancelOrder)
adminRoute.get('/admin/sales-report',auth.adminLogin,adminController.salesReport)
adminRoute.get('/admin/salesReport/view',auth.adminLogin,adminController.salesReportView)
adminRoute.get('/admin/daily-sales',auth.adminLogin,adminController.dailySalesReport)
adminRoute.get('/admin/weekly-sales',auth.adminLogin,adminController.weeklySalesReport)
// adminRoute.get('/admin/annual-sales',auth.adminLogin,adminController.annualSalesReport)

adminRoute.get('/admin/logout',auth.adminLogout);

module.exports =adminRoute;