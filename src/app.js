const express = require('express');
require('./config/database');


const app = express();
const port = process.env.PORT || 3000;



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})

// meghrajthakre444_db_user
// MeghrajThakre@1234