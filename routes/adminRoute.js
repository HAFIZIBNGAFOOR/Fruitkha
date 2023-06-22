const express=require('express');
const adminRoute = express();
const adminController =require('../controllers/adminController');
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
adminRoute.get('/admin/users',auth.adminLogin,adminController.userLoad);
// adminRoute.post('/admin/users',auth.adminLogin,adminController.searchResult);
adminRoute.post('/admin/users/block',adminController.blockUser);
adminRoute.post('/admin/users/unblock',adminController.unBlockUser);
adminRoute.get('/admin/category',auth.adminLogin,adminController.categoryLoad);
adminRoute.get('/admin/addCategory',auth.adminLogin,adminController.addCategory);
adminRoute.post('/admin/addCategory',Upload.single('file'), adminController.categoryAdding);
adminRoute.post('/admin/deleteCategory',auth.adminLogin,adminController.deleteCategory);
adminRoute.get('/admin/editCategory',auth.adminLogin,adminController.editCategory)
adminRoute.post('/admin/editCategory',Upload.single('file') ,adminController.saveEditedCategory);
adminRoute.get('/admin/product',auth.adminLogin,adminController.productLoad)
adminRoute.get('/admin/addProduct',auth.adminLogin,adminController.addProduct)
adminRoute.post('/admin/addProduct',Upload.array('images',3),adminController.SaveAddProduct)
adminRoute.get('/admin/editProduct',auth.adminLogin,adminController.editProduct);
adminRoute.post('/admin/editProduct',Upload.array('images',3),adminController.saveEditedProduct);
adminRoute.post('/admin/deleteProduct',adminController.deleteProduct);
adminRoute.get('/admin/coupon',auth.adminLogin,adminController.laodCoupon);
adminRoute.get('/admin/addCoupon',auth.adminLogin,adminController.addCoupon);
adminRoute.post('/admin/addCoupon',auth.adminLogin,adminController.saveAddCoupon);
adminRoute.get('/admin/orders',auth.adminLogin,adminController.loadOrders);
// adminRoute.get('/admin/viewOrder',auth.adminLogin,adminController.viewSingleOrder);
adminRoute.get('/admin/order-details',auth.adminLogin,adminController.viewSingleOrder)
adminRoute.get('/admin/change-status',auth.adminLogin,adminController.changeStatus);
adminRoute.get('/admin/cancel-order',auth.adminLogin,adminController.cancelOrder)
adminRoute.get('/admin/sales-report',auth.adminLogin,adminController.salesReport)
adminRoute.get('/admin/salesReport/view',auth.adminLogin,adminController.salesReportView)
adminRoute.get('/admin/daily-sales',auth.adminLogin,adminController.dailySalesReport)
adminRoute.get('/admin/weekly-sales',auth.adminLogin,adminController.weeklySalesReport)
// adminRoute.get('/admin/annual-sales',auth.adminLogin,adminController.annualSalesReport)

adminRoute.get('/admin/logout',auth.adminLogout);

module.exports =adminRoute;