const isAdminPage = (req,res,next)=>{
    if(req.userInfo.role !== "admin"){
        return res.status(403).json({
            success: false, message: "Access is denied! Admin rights are required to display"
        })
    }
    next();
}
module.exports = isAdminPage