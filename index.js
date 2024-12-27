import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { default as mongoose } from 'mongoose'
const app = express()
const port = 3000
const secretkey = "bdjksbdg121dgifjdgjof75489"

app.use(express.json());

const userSchema = new mongoose.Schema({
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    role:{type:String,required:true,default:"user"}
});

const userModel = mongoose.model('userModel', userSchema);

app.get('/user', async (req, res) => {
    const data = await userModel.find();
    res.send(data)
})
app.get('/profile', async (req, res) => {
    const token = req.header('Authorization');
if (!token) return res.send({ error: 'Access denied' });
try {
 const decoded = jwt.verify(token, secretkey);
  res.send("welcome")
 } catch (error) {
 res.send({ error: 'Invalid token' });
 }
 })
 app.get('/adminpanel', async (req, res) => {
    const token = req.header('Authorization');
if (!token) return res.send({ error: 'Access denied' });
try {
 const decoded = jwt.verify(token, secretkey);
 if (decoded.role=="admin") {
    res.send("welcome")
 } else {
    res.send("no access")
 }

 } catch (error) {
 res.send({ error: 'Invalid token' });
 }
 })




app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    const data = await userModel.findById(id);
    res.send(data)
})

app.post('/register', async (req, res) => {
    const { role, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const tempObj = { role, email, password: hashedPassword };
    const data = await userModel.create(tempObj);

    res.send(data)
})
    app.post('/login', async (req, res) => {
    try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
    return res.send({ error: 'Authentication failed' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
    return res.send({ error: 'Authentication failed' });
    }
    const token = jwt.sign({ userId: user._id,role:user.role }, secretkey, {
    expiresIn: '1h',
    });
    res.send({ token });
    } catch (error) {
    res.send({ error: 'Login failed' });
    }
    });
   
  
app.put('/user/:id', async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    const data = await userModel.findByIdAndUpdate(id, { ...body })
    res.send(data)
}
)

app.delete('/user/:id', async (req, res) => {
    const { id } = req.params;
    await userModel.findByIdAndDelete(id)
    res.send('Got a DELETE request at /user')
})

app.listen(port, () => {
    mongoose.connect('mongodb+srv://gulbaneabp216:SADAFCIK123@cluster0.ka54n.mongodb.net/n')
        .then(() => console.log("connected"))
        .catch((err) => console.log(err))
    console.log(`Example app listening on port ${port}`)
})