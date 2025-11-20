const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const cb0 = function (req, res, next) {
  console.log('CB0')
  next()
}

const cb1 = function (req, res, next) {
  console.log('CB1')
  next()
}

const cb2 = function (req, res) {
  res.send('Hello from C!')
}

app.get('/example/c', [cb0, cb1, cb2])

app.use('/home', (req,res)=>{
    res.download('src/samfple.pdf', 'meghrajs.pdf',(err)=>{
        if(err){
            console.log(err);
        res.status(400).send('Error downloading file');

        }else{
            console.log('File downloaded successfully');
        }
    })

})
app.use('/about', (req,res)=>{
    res.send('Hello World! from home route');

})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})