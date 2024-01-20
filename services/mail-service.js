import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	auth: {
		user: 'mrdilmurat777@gmail.com',
		pass: 'qweqkthkikjildhh'
	}
})

export const sendActivationMail = async (to, link) => {
	
	await transporter.sendMail({
		from: 'mrdilmurat777@gmail.com',
		to, 
		subject: 'Активация аккаунта http://localhost:4444',
		text: '',
		html: 
			`
			<div>
				<h1>Для активации перейдите по ссылке</h1>
				<a href="${link}">${link}</a>
			</div>
			`
	})
}

export const sendResetPasswordMail = async (to, link) => {
	
	await transporter.sendMail({
		from: 'mrdilmurat777@gmail.com',
		to, 
		subject: 'Сброс пароля http://localhost:4444',
		text: '',
		html: 
			`
			<div>
				<h1>Для сброс пароля перейдите по ссылке</h1>
				<a href="${link}">${link}</a>
			</div>
			`
	})
}


export const activationLink = async (activateLink) => {
	const user = await UsersModel.findOne({ activateLink })
	
	if (!user) {
		throw new Error('Некорректная ссылка активации')
	}
	user.isActivated = true

	await user.save()
}