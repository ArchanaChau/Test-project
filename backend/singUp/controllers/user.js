//Validation
const user = import("./user");

async function handleUserSignUp(req, res) {
  const { name, email, password } = req.body;
  await user.create({
    name,
    email,
    password,
  });
  return res.render("home");
}
module.exports = { handleUserSignUp };
