// db.js
import pkg from "pg";
const { Pool } = pkg;

const 
pool = new Pool({
  host: "dev-tesseract.c5ntn5ntm20l.ap-south-1.rds.amazonaws.com",
  user: "tesseract",
  port: 5432,
  password: "eAT9XIo4SgNjCNN46Cgb",
  database: "tesseract_dev",
  max: 20,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export default pool;
