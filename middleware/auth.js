const userlogin= (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/')
    }
}
const userLogout= (req,res,next)=>{
    if(req.session.user){
        req.session.user=false
        req.session.destroy();
        console.log('session destroyed');
        userData=undefined
        res.redirect('/login');
    }else{
        next();
    }
};
const adminLogin=(req,res,next)=>{
    if(req.session.admin){
        next()
    }else{
        res.render('adminLogin')
    }
};
const adminLogout=(req,res,next)=>{
    if(req.session.admin){
        req.session.admin=false;
        res.redirect('/admin');
    }else{
        next()
    }
}
module.exports={adminLogout,adminLogin,userLogout,userlogin};