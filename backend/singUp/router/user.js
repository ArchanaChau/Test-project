const express = import("express");
const { handleUserSignUp } = import("../controllers/user");
const router = express.Router();
router.post("/", handleUserSignUp);

router.get('/signup', (req, res) => {
    return res.render('signup')
})
module.exports = router;
