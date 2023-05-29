import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import mongoose, { Document, Schema } from 'mongoose';
import bodyParser from 'body-parser';
import multer from 'multer';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

interface IProduct extends Document {
    name: string,
    price: number,
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
})

const ProductModel = mongoose.model<IProduct>('Product', ProductSchema)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const upload = multer()
app.use(upload.none())

app.get('/', (req: Request, res: Response) => {
    res.send('Ini halaman dashboard')
})

app.get('/products', async (req: Request, res: Response) => {
    try {
        const products = await ProductModel.find();
        res.json(products)
    } catch (Err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/products', async (req: Request, res: Response) => {
    const { name, price } = req.body;
    try {
        const product = await ProductModel.create({ name, price })
        res.json(product)
    } catch(err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.put('/products/:_id', async (req: Request, res: Response) => {
    const id = req.params
    const { name, price } = req.body
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(id, { name, price })
        if(updatedProduct) {
            res.json({
                status: 'success',
                message: 'data berhasil di update.'
            })
        } else {
            res.status(404).json({ error: 'Product not found' })
        }
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

app.delete('/products/:_id', async (req: Request, res: Response) => {
    const id = req.params
    try {
        const deletedProduct = await ProductModel.findByIdAndDelete(id)
        if(deletedProduct) {
            res.json({
                status: 'success',
                message: 'Product berhasil di hapus'
            })
        } else {
            res.status(404).json({ error: 'Product not found' })
        }
    } catch(err) {
        res.status(500).json({ error: err })
    }
})

mongoose.connect('mongodb://127.0.0.1:27017/product')
.then(() => {
    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
    })
})
.catch((err) => {
    console.log('Error connecting to MongoDB:', err)
})
