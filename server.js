const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ObjectId, GridFSBucket } = require('mongodb')
const handleSignUp = require('./controllers/signup')
const handleSignIn = require('./controllers/signin')
const { handleAddingAddress, handleDeletingAddress, handleUpdatingAddress } = require('./controllers/shipping')
const { handleChangeData, handleChangePassword } = require('./controllers/profile')
const { handleAddingItems, handleRemovingItems, handleClearCart } = require('./controllers/cartItems')
const { handleAddingOrder, handleRemovingOrder } = require('./controllers/orders')
const handlePayment = require('./controllers/payment')
const { handleConfirmation, handleResendEmail } = require('./controllers/confirm')
// const multer = require('multer')
// const GridFSStorage = require('multer-gridfs-storage')
// const handleUploadingImage = require('./controllers/images')


;
(async () => {
	try {
		const client = await MongoClient.connect(process.env.MONGO_URI, { useUnifiedTopology: true })
		const db = client.db('DB')
		// let photosBucket = new GridFSBucket(db, {
		// 	bucketName: 'Photos'
		// })
		// let iconsBucket = new GridFSBucket(db, {
		// 	bucketName: 'Icons'
		// })
		// const storage = new GridFSStorage({ db, client,
		// 	file: (req, file) => {
		// 		if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		// 			return {
		// 				filename: file.originalname,
		// 				bucketName: 'Photos'
		// 			}
		// 		} else if (file.mimetype === 'image/svg+xml') {
		// 			return {
		// 				filename: file.originalname,
		// 				bucketName: 'Icons'
		// 			}
		// 		}
		// 		else {
		// 			return null
		// 		}
		// 	}
		// })
		// const upload = multer({ storage })
		const users = db.collection('Users')
		const products = db.collection('Products')

		app.use(express.json())
		// app.use(express.urlencoded({ extended: true }))
		app.use(cors())

		app.get('/', async (req, res) => {
			const resultCursor = users.find({})
			const result = await resultCursor.toArray()
			res.json(result)
		})

		app.get('/products', async (req, res) => {
			const resultCursor = products.find({})
			const result = await resultCursor.toArray()
			res.json(result)
		})

		// app.get('/photos', async (req, res) => {
		// 	iconsBucket.find().toArray((err, files) => {
		// 		res.json(files)
		// 		files.map(({ _id }) => {
		// 			photosBucket.openDownloadStream(ObjectId(_id)).pipe(res)
		// 		})
		// 	})
		// })

		
		// app.get('/icons/:name', async(req, res) => {
		// 	const icon = iconsBucket.find({filename: req.params.name})
		// 	const file = await icon.toArray()
		// 	res.send(file)
		// 		// files.map( f => {
		// 			// iconsBucket.openDownloadStreamByName(req.params.name).pipe(res)
		// 		// })
		// 	// })
		// 	// iconsBucket.openDownloadStreamByName(req.params.name).pipe(res)

		// 	// iconsBucket.find({ filename : https://robohash.org/1req.params.name}).toArray((err, files) => {
		// 	// 	files.map(({ filename }) => {
		// 	// 		iconsBucket.openDownloadStreamByName(filename).pipe(res)
		// 	// 	})
		// 	// })
		// })
		app.post('/signup', (req, res) => handleSignUp(req, res, users))
		
		app.post('/confirm/:id', (req, res) => handleConfirmation(req, res, users))
		
		app.post('/resendemail', (req, res) => handleResendEmail(req, res, users))

		app.post('/signin', (req, res) => handleSignIn(req, res, users))
		
		app.put('/changedata', (req, res) => handleChangeData(req, res, users))
		
		app.put('/changepassword', (req, res) => handleChangePassword(req, res, users))
		
		app.put('/addaddress', (req, res) => handleAddingAddress(req, res, users))
		
		app.put('/updateaddress', (req, res) => handleUpdatingAddress(req, res, users))
		
		app.delete('/deleteaddress', (req, res) => handleDeletingAddress(req, res, users))
		
		app.put('/additem', (req, res) => handleAddingItems(req, res, users))
		
		app.put('/removeitem', (req, res) => handleRemovingItems(req, res, users))
		
		app.put('/clearcart', (req, res) => handleClearCart(req, res, users))
		
		app.put('/addorder', (req, res) => handleAddingOrder(req, res, users))
		
		app.put('/removeorder', (req, res) => handleRemovingOrder(req, res, users))
		
		app.post('/payment', (req, res) => handlePayment(req, res, users, products))
		
		// app.post('uploadicons', upload.array('icons', 20), (req, res) =>{
		// 	res.json('S')
		// })
		
		// app.post('/uploadimage/:productId', upload.single('file'), async(req, res) =>{
			// 	const { id, filename } = req.file
			// 	const result = await products.updateOne(
				// 		{ id : Number(req.params.productId) },
				// 		{ $set: { photo: { id, filename } } }
				// 	)
				// 	res.json(result)
				// })
				
				// app.get('/productphoto/:id', async(req, res) =>{
					// 	const product = await products.findOne({id: Number(req.params.id)})
					// 	const photoId = product.photo[0].id
					// 	photosBucket.find({ _id: photoId }).toArray((err, files) =>{
						// 		photosBucket.openDownloadStream(ObjectId(photoId)).pipe(res)
						// 	})
						// })
						
		app.get('/findById/:id', async (req, res) => {
			const user = await users.findOne({_id: ObjectId(req.params.id)})
			res.json(user)
		})

		app.delete('/delById/:id', async (req, res) => {
			const deletedUser = await users.deleteOne({ _id: ObjectId(req.params.id) })
			res.json(deletedUser)
		})

		app.delete('/delByName/:name', async (req, res) => {
			const deletedUser = await users.deleteMany({ name: req.params.name })
			res.json(deletedUser)
		})
		
		const port = process.env.PORT || 8888
		app.listen(port, () => console.log(`listening on port ${port}`))
		
	} catch (err) {
		console.error(err)
	}
})()



