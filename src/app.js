const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use('/home', (req,res)=>{
    res.send('Hello World! from home route');

})
app.use('/about', (req,res)=>{
    res.send('Hello World! from home route');

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})