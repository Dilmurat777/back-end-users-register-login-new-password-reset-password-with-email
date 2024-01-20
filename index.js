import express from 'express';
import { addOneCar, changeOneCar, getAllCars, getOneCar } from './controllers/cars.js';
import { activate, changeUser, deleteUser, login, register, resetPassword, setNewResetPassword } from './controllers/users.js';
import checkAuth from './validations/checkAuth.js';



const api = express();

api.use(express.json())

api.get('/', (req, res) => {
  res.send('Hello, this is the root endpoint!');
});

//cars
api.get('/cars', getAllCars);
api.get('/cars/:id', getOneCar);

//add one car
api.post('/cars', addOneCar)
api.patch('/cars/:id', changeOneCar)


//user
api.post('/register', register)

api.post('/login', login)

api.patch('/users/:id', checkAuth, changeUser)

api.get('/active/:link', activate)

api.post('/reset-password', resetPassword)

api.patch('/set-new-reset-password/:link', setNewResetPassword)

api.delete('/delete-user/:id', deleteUser)



const PORT = 4444;
api.listen(PORT, () => {
  console.log(`сервер запущен на порту http://localhost:${PORT}`);
});
