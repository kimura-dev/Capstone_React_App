module.exports = {

  ensurePublicOrOwner: function(req, res, next){
    if(!req.log){
      res.status(404).json({
        message: 'No log entry found'
      })
    }
    if(req.log.status == 'public' || req.user.id == req.log.user._id){
      next()
    } else {
      res.status(403).json({
        message: 'Not allowed access to this log'
      })
    }
  }
}

