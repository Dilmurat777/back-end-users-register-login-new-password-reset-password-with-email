import { readFile, writeFile } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = join(__dirname, '..', 'data', 'cars.json');


// get all cars
export const getAllCars = (req, res) => {
  try {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.json(JSON.parse(data));
    });
  } catch (error) {
    res.status(500).json({ status: 'error' });
  }
};

//get one car
export const getOneCar = (req, res) => {
  try {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      const car = JSON.parse(data).find((item) => item.id == req.params.id);
      if (!car) {
        throw new Error('Машина не найдена');
      }
      res.json(car);
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      message: error.message,
    });
  }
};

//add one Car
export const addOneCar = (req, res) => {
  try {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      const newCars = [...JSON.parse(data), { ...req.body, id: uuidv4() }];
      writeFile(filePath, JSON.stringify(newCars), 'utf8', (err) => {
        if (err) {
          throw new Error('Ошибка при добавлении данных');
        }
        res.json({ status: 'success', message: 'Машина добавлена' });
      });
    });
  } catch (error) {
    res.json({ message: err.message, status: 'error' });
  }
};

//car chenge
export const changeOneCar = (req, res) => { 
  try {
    
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        throw err
      }

      const car = JSON.parse(data).some((item) => item.id == req.params.id);
      if (!car) {
        throw new Error('Машина не найдена');
      }

      const newCars = JSON.parse(data).map((item) => {
        if (item.id == req.params.id) {
          return {...item, ...req.body}
        }
        return item
      });

      writeFile(filePath, JSON.stringify(newCars), 'utf8', (err) => {
        if (err) {
          throw new Error('Ошибка при изменение машин')
        }
        res.json({ status: 'success', message: 'Машина изменено' });
      })

    })

  } catch (error) {
    res.json({ message: error.message, status: 'error' });
  }
}

