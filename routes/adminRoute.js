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
adminRoute.post('/admin/dashboard',adminController.loginAdmin)
adminRoute.get('/admin/dashboard',auth.adminLogin,adminController.loadDashboard)
adminRoute.get('/admin/users',auth.adminLogin,adminController.userLoad);
adminRoute.post('/admin/users',auth.adminLogin,adminController.searchResult);
adminRoute.post('/admin/users/block',adminController.blockUser);
adminRoute.post('/admin/users/unblock',adminController.unBlockUser);
adminRoute.get('/admin/category',auth.adminLogin,adminController.categoryLoad);
adminRoute.get('/admin/category/add',auth.adminLogin,adminController.addCategory);
adminRoute.post('/admin/category/add',Upload.single('file'), adminController.categoryAdding);
adminRoute.post('/admin/deleteCategory',auth.adminLogin,adminController.deleteCategory);
adminRoute.get('/admin/editCategory',auth.adminLogin,adminController.editCategory)
adminRoute.post('/admin/editCategory',Upload.single('file') ,adminController.saveEditedCategory);
adminRoute.get('/admin/product',auth.adminLogin,adminController.productLoad)
adminRoute.get('/admin/addProduct',auth.adminLogin,adminController.addProduct)
adminRoute.post('/admin/addProduct',Upload.array('images',3),adminController.SaveAddProduct)
adminRoute.get('/admin/editProduct',auth.adminLogin,adminController.editProduct);
adminRoute.post('/admin/editProduct',Upload.array('images',3),adminController.saveEditedProduct);
adminRoute.post('/admin/deleteProduct',adminController.deleteProduct);
adminRoute.get('/admin/logout',auth.adminLogout);

module.exports =adminRoute;