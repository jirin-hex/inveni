const blockAdmin = (req,res,next) => {
    return res.status(403).send('forbidden');
}

module.exports = blockAdmin;