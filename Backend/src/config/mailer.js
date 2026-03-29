import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:process.env.GMAIL_USER,
    pass:process.env.GMAIL_PASS
  }
})

export const sendVerificationEmail = async (to,token) =>{
  const url = `http://localhost:5000/api/user/verify-email/?token=${token}`;

  await transporter.sendMail({
    from:`"AI Job Preparation ${process.env.GMAIL_USER}"`,
    to,
    subject:'Verify your email.',
    html:`<p>Click <a href="${url}">here</a> to verify your email</p>`
  })
}