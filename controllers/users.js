import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt"; 
import jwt from 'jsonwebtoken'
import { sendActivationMail, sendResetPasswordMail } from '../services/mail-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = join(__dirname, '..', 'data', 'users.json');

//register
export const register = async (req, res) => {
	try {

		const data = await readFile(filePath, 'utf8')
		const { password, ...user } = req.body
		
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const activeLink = uuidv4()
		
		const newUser = {
			...user,
			passwordHash: hash,
			id: uuidv4(),
			isActivated: false,
			activateLink: activeLink
		}

		await sendActivationMail(newUser.email, `http://localhost:4444/active/${activeLink}`)

		const newData = [...JSON.parse(data), newUser]

		await writeFile(filePath, JSON.stringify(newData), 'utf8')


		const accessToken = jwt.sign({
			_id: newUser._id, email: newUser.email
		}, 'secret123', {expiresIn: '1d'})

		const {passwordHash, activateLink, ...other} = newUser
		res.json({user: other, accessToken})
		res.json({status: 'success', message: 'Вы зарегистрированы'})
		
	} catch (error) {
		res.status(500).json(
			{
				message: error.message
			}
		) 
	}
}

//login
export const login = async (req, res) => {
	try {
		const data = await readFile(filePath, 'utf8')
		const { password, email } = req.body
		
		const existingUser = JSON.parse(data).find((value, index, array) => value.email === email)

		if (!existingUser) {
			throw new Error('Такой аккаунт не существует')
		}

		const checkPass = await bcrypt.compare(password, existingUser.passwordHash)

		if (!checkPass) {
			throw new Error('Аккаунт или пароль виден не правильно')
		}

		const { passwordHash, ...other } = existingUser

		const accessToken = jwt.sign({
			_id: existingUser._id
		}, 'secret123', {expiresIn: '1d'})

		res.json({user: other, accessToken})

	} catch (error) {
		res.status(500).json(
			{
				message: error.message
			}
		) 
	}
}

//reset password
export const resetPassword = async (req, res) => {
	try {
		let data = await readFile(filePath, 'utf8')

		data = JSON.parse(data)


		const idx = data.findIndex((value, index, array) => value.email === req.body.email)

		if (idx < 0) {
			throw new Error('Такой аккаунт не существует')
		}

		const resetLink = uuidv4()

		data[idx].resetLink = resetLink

		await sendResetPasswordMail(req.body.email, `http://localhost:3000/reset-password/${resetLink}`)

		await writeFile(filePath, JSON.stringify(data), 'utf8')


		res.json({status: 'success', message: 'Для сброса пароля перейдите по ссылки на посте'})
		
	} catch (error) {
		res.status(500).json(
			{
				message: error.message
			}
		) 
	}
}

// set new password
export const setNewResetPassword = async (req, res) => {
	try {
		let data = await readFile(filePath, 'utf8')

		data = JSON.parse(data)

		const idx = data.findIndex(item => item.resetLink === req.params.link)

		if (idx < 0) {
			throw new Error('Неверная ссылка для сброса')
		}

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(req.body.password, salt);

		data[idx].passwordHash = hash

		delete data[idx].resetLink

		await writeFile(filePath, JSON.stringify(data), 'utf8')

		res.json({status: 'success', message: 'Пароль успешно изменен'})

	} catch (error) {
		res.status(500).json(
			{
				message: error.message
			}
		) 
	}
}

//activate account
export const activate = async (req, res) => {
	try {

		let data = await readFile(filePath, 'utf8')

		data = JSON.parse(data)

		const idx = data.findIndex(item => item.activateLink === req.params.link)

		if (idx < 0) {
			throw new Error('Некорректная ссылка активации')
		}

		data[idx].isActivated = true
		delete data[idx].activateLink

		await writeFile(filePath, JSON.stringify(data), 'utf8')
		return res.redirect('https://mail.ru/')

	} catch (error) {
		res.status(500).json({
			message: error.message
		})
	}
}

//changeUser
export const changeUser = async (req, res) => {
	try {
		const userId = req.params.id
		let data = await readFile(filePath, 'utf8')

		data = JSON.parse(data)

		const existingUser = data.findIndex(item => item.id == userId)
		
		if (!existingUser) {
			throw new Error('Такой аккаунт не существует')
		}

		data[existingUser] = {...data[existingUser], ...req.body}

		await writeFile(filePath, JSON.stringify(data), 'utf8')

		res.json(data[existingUser])
		
	} catch (error) {
		res.status(500).json(
			{
				message: error.message
			}
		) 
	}
}

//delete user
export const deleteUser = async (req, res) => {
	try {
			const userId = req.params.id;
			let data = await readFile(filePath, 'utf8');
			data = JSON.parse(data);

			// Найти индекс пользователя в массиве по ID
			const userIndex = data.findIndex(item => item.id === userId);

			// Если пользователь с указанным ID найден, удалить его из массива
			if (userIndex !== -1) {
					data.splice(userIndex, 1);
					await writeFile(filePath, JSON.stringify(data), 'utf8');
					res.json({ status: 'success', message: 'Пользователь успешно удален' });
			} else {
					res.status(404).json({ status: 'error', message: 'Пользователь с указанным ID не найден' });
			}
	} catch (error) {
			res.status(500).json({
					status: 'error',
					message: error.message
			});
	}
};


